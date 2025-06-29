"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Search, Filter, BarChart3, MessageSquare, Users, Activity, ThumbsUp, Eye, Lock, Pin, CheckCircle, Tag as TagIcon, Trash2, Edit, MoreVertical, AlertTriangle, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Import defined types
import type { ForumThread, ForumCategory, ForumStats, UserProfile, ForumReply, Tag, ForumThreadPayload, ForumReplyPayload, ReportPayload } from "@/types/forum"
// Import the API service
import { forumApi } from "@/services/forumApi"

// Helper to format date (simplified)
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ForumAdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [stats, setStats] = useState<ForumStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("latest")

  // State for "Create New Forum" dialog
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false)
  const [newForumTitle, setNewForumTitle] = useState("")
  const [newForumContent, setNewForumContent] = useState("")
  const [newForumCategory, setNewForumCategory] = useState<string>("")
  const [newForumTags, setNewForumTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([]) // To store available tags for selection

  // State for viewing/replying to a thread
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [selectedThreadReplies, setSelectedThreadReplies] = useState<ForumReply[]>([])
  const [isViewThreadLoading, setIsViewThreadLoading] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isListActionLoading, setIsListActionLoading] = useState(false) // General loading for table/list actions

  // State for Report Dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportingContent, setReportingContent] = useState<{ type: "thread" | "reply"; id: string } | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  // State for Edit Thread Dialog
  const [isEditForumOpen, setIsEditForumOpen] = useState(false)
  const [editingThread, setEditingThread] = useState<ForumThread | null>(null)
  const [editForumTitle, setEditForumTitle] = useState("")
  const [editForumContent, setEditForumContent] = useState("")
  const [editForumCategory, setEditForumCategory] = useState<string>("")
  const [editForumTags, setEditForumTags] = useState<string[]>([])
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)


  const loadInitialData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [threadsData, categoriesData, statsData, tagsData] = await Promise.all([
        forumApi.getThreads(),
        forumApi.getCategories(),
        forumApi.getStats(),
        forumApi.getTags(), // Fetch all available tags
      ])
      setThreads(threadsData)
      setCategories(categoriesData)
      setStats(statsData)
      setAllTags(tagsData)
    } catch (e: any) {
      setError(e.message || "Failed to load forum data. Please try again.")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const filteredAndSortedThreads = useMemo(() => {
    return threads
      .filter(thread =>
        (selectedCategory === "all" || thread.category.id === selectedCategory) &&
        (thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
         thread.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => {
        // Pinned threads always on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === "latest_activity") { // Default to this if sorting by lastReplyAt
             const dateA = a.lastReplyAt ? new Date(a.lastReplyAt).getTime() : new Date(a.createdAt).getTime();
             const dateB = b.lastReplyAt ? new Date(b.lastReplyAt).getTime() : new Date(b.createdAt).getTime();
             return dateB - dateA;
        }
        if (sortBy === "creation_date") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === "most_replies") {
          return b.repliesCount - a.repliesCount
        }
        if (sortBy === "most_upvotes") {
          return b.upvotes - a.upvotes
        }
        return 0
      });
  }, [threads, searchTerm, selectedCategory, sortBy])

  const handleCreateForumSubmit = async () => {
    if (!newForumTitle || !newForumContent || !newForumCategory) {
      alert("Please fill in all required fields (Title, Content, Category).")
      return
    }
    // Map selected tag names to their IDs. Create new tags if not found (mock behavior)
    const tagIds = newForumTags.map(tagName => {
        const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        return existingTag ? existingTag.id : tagName; // In real API, backend might create new tag or reject
    });

    const payload: ForumThreadPayload = {
      title: newForumTitle,
      content: newForumContent,
      categoryId: newForumCategory,
      tagIds: tagIds,
    }

    setIsListActionLoading(true)
    try {
      const newThread = await forumApi.createThread(payload)
      setThreads(prev => [newThread, ...prev])
      // Optionally, refresh stats
      const updatedStats = await forumApi.getStats();
      setStats(updatedStats);

      setIsCreateForumOpen(false)
      setNewForumTitle("")
      setNewForumContent("")
      setNewForumCategory("")
      setNewForumTags([])
    } catch (e: any) {
      setError(e.message || "Failed to create thread.")
      console.error(e)
    } finally {
      setIsListActionLoading(false)
    }
  }

  const fetchThreadDetails = async (threadId: string) => {
    setIsViewThreadLoading(true);
    setError(null); // Clear previous errors
    try {
        const threadData = await forumApi.getThreadById(threadId);
        if (threadData) {
            setSelectedThread(threadData);
            setSelectedThreadReplies(threadData.replies || []);
        } else {
            setError("Thread not found.");
            setSelectedThread(null);
            setSelectedThreadReplies([]);
        }
    } catch (e: any) {
        setError(e.message || "Failed to load thread details.");
        console.error(e);
        setSelectedThread(null);
        setSelectedThreadReplies([]);
    } finally {
        setIsViewThreadLoading(false);
    }
  };

  const handlePostReply = async (threadId: string) => {
    if (!replyContent || !selectedThread) return;

    const payload: ForumReplyPayload = {
        content: replyContent,
        // parentId: currentlyReplyingToReplyId // UI for this not implemented
    };

    setIsSubmittingReply(true);
    setError(null);
    try {
      const newReply = await forumApi.createReply(threadId, payload);
      if (newReply) {
        setSelectedThreadReplies(prev => [...prev, newReply]);

        const updatedThreadFields = {
            repliesCount: (selectedThread?.repliesCount || 0) + 1,
            lastReplyAt: newReply.createdAt
        };

        setThreads(prevThreads => prevThreads.map(t =>
            t.id === threadId
            ? { ...t, ...updatedThreadFields }
            : t
        ));
        // Update the selectedThread state completely including the new reply in its list
        setSelectedThread(st => st ? {
            ...st,
            ...updatedThreadFields,
            replies: [...(st.replies || []), newReply]
        } : null);

        setReplyContent("");
        const updatedStats = await forumApi.getStats();
        setStats(updatedStats);
      }
    } catch (e: any) {
      setError(e.message || "Failed to post reply.");
      console.error(e);
    } finally {
      setIsSubmittingReply(false);
    }
  }

  // --- Moderation Handlers ---
  const handlePinThread = async (threadId: string, currentIsPinned: boolean) => {
    setIsListActionLoading(true);
    try {
        await forumApi.pinThread(threadId, !currentIsPinned);
        setThreads(prevs => prevs.map(t => t.id === threadId ? {...t, isPinned: !currentIsPinned, updatedAt: new Date().toISOString()} : t));
    } catch (e: any) {
        setError(e.message || `Failed to ${currentIsPinned ? 'unpin' : 'pin'} thread.`);
    } finally {
        setIsListActionLoading(false);
    }
  };

  const openEditForumDialog = (thread: ForumThread) => {
    setError(null); // Clear previous errors specific to this dialog's context
    setEditingThread(thread);
    setEditForumTitle(thread.title);
    setEditForumContent(thread.content);
    setEditForumCategory(thread.category.id);
    setEditForumTags(thread.tags.map(tag => tag.name));
    setIsEditForumOpen(true);
  };

  const handleEditForumSubmit = async () => {
    if (!editingThread || !editForumTitle || !editForumContent || !editForumCategory) {
      alert("Please fill in all required fields (Title, Content, Category).");
      return;
    }

    const tagIds = editForumTags.map(tagName => {
        const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        return existingTag ? existingTag.id : tagName; // Mock: assumes backend handles new tag name strings
    });

    const payload: Partial<ForumThreadPayload> = { // Partial because not all fields might be editable or sent
      title: editForumTitle,
      content: editForumContent,
      categoryId: editForumCategory,
      tagIds: tagIds,
    };

    setIsSubmittingEdit(true);
    setError(null);
    try {
      const updatedThread = await forumApi.updateThread(editingThread.id, payload);
      if (updatedThread) {
        setThreads(prevs => prevs.map(t => t.id === updatedThread.id ? updatedThread : t));
        if (selectedThread && selectedThread.id === updatedThread.id) {
          // If the currently viewed thread is the one being edited, update it as well
          setSelectedThread(updatedThread);
        }
        setIsEditForumOpen(false);
        setEditingThread(null);
      } else {
        throw new Error("Failed to receive updated thread data from API.");
      }
    } catch (e: any) {
      console.error("Failed to update thread:", e);
      setError(e.message || "Failed to update thread. Please try again.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };


  const openReportDialog = (type: "thread" | "reply", id: string) => {
    setError(null); // Clear previous errors specific to this dialog's context
    setReportingContent({ type, id });
    setIsReportDialogOpen(true);
    setReportReason(""); // Clear previous reason
  };

  const handleReportSubmit = async () => {
    if (!reportingContent || !reportReason) {
        alert("Please provide a reason for the report.");
        return;
    }
    setIsSubmittingReport(true);
    setError(null);
    try {
        const payload: ReportPayload = {
            contentId: reportingContent.id,
            contentType: reportingContent.type,
            reason: reportReason,
        };
        await forumApi.reportContent(payload);
        // Maybe show a success toast/message here
        console.log("Report submitted successfully for", reportingContent);
        setIsReportDialogOpen(false);
        setReportingContent(null);
        setReportReason("");
    } catch (e: any) {
        console.error("Failed to submit report:", e);
        setError(e.message || "Failed to submit report. Please try again.");
        // Keep dialog open if error to allow retry or show error in dialog
    } finally {
        setIsSubmittingReport(false);
    }
  };

  const handleLockThread = async (threadId: string, currentIsLocked: boolean) => {
    setIsListActionLoading(true);
    try {
        await forumApi.lockThread(threadId, !currentIsLocked);
        setThreads(prevs => prevs.map(t => t.id === threadId ? {...t, isLocked: !currentIsLocked, updatedAt: new Date().toISOString()} : t));
        if (selectedThread && selectedThread.id === threadId) {
            setSelectedThread(st => st ? {...st, isLocked: !currentIsLocked} : null);
        }
    } catch (e: any) {
        setError(e.message || `Failed to ${currentIsLocked ? 'unlock' : 'lock'} thread.`);
    } finally {
        setIsListActionLoading(false);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm("Are you sure you want to delete this thread? This action cannot be undone.")) return;
    setIsListActionLoading(true);
    try {
        await forumApi.deleteThread(threadId);
        setThreads(prevs => prevs.filter(t => t.id !== threadId));
        if (selectedThread && selectedThread.id === threadId) {
            setSelectedThread(null); // Close view if deleted thread was open
        }
        const updatedStats = await forumApi.getStats(); // Refresh stats
        setStats(updatedStats);
    } catch (e: any) {
        setError(e.message || "Failed to delete thread.");
    } finally {
        setIsListActionLoading(false);
    }
  };

  const handleDeleteReply = async (threadId: string, replyId: string) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    setIsSubmittingReply(true); // Use reply submitter's loading state or a new one
    try {
        await forumApi.deleteReply(threadId, replyId);
        setSelectedThreadReplies(prev => prev.filter(r => r.id !== replyId));
        setThreads(prevThreads => prevThreads.map(t =>
            t.id === threadId
            ? { ...t, repliesCount: Math.max(0, t.repliesCount - 1) } // Decrement, ensure not negative
            : t
        ));
         if (selectedThread && selectedThread.id === threadId) {
            setSelectedThread(st => st ? {...st, repliesCount: Math.max(0, st.repliesCount - 1)} : null);
        }
        const updatedStats = await forumApi.getStats(); // Refresh stats
        setStats(updatedStats);
    } catch (e: any) {
        setError(e.message || "Failed to delete reply.");
    } finally {
        setIsSubmittingReply(false);
    }
  };

  const handleMarkAsSolution = async (threadId: string, replyId: string, currentIsSolution: boolean) => {
    setIsSubmittingReply(true);
    try {
        await forumApi.markReplyAsSolution(threadId, replyId, !currentIsSolution);
        // Update reply in selectedThreadReplies
        setSelectedThreadReplies(prevReplies => prevReplies.map(r => {
            if (r.id === replyId) return { ...r, isSolution: !currentIsSolution };
            // If setting a new solution, unmark other solutions in this thread's view
            if (!currentIsSolution && r.isSolution) return { ...r, isSolution: false };
            return r;
        }));
        // Update thread in main list
        setThreads(prevThreads => prevThreads.map(t =>
            t.id === threadId
            ? { ...t, hasSolution: !currentIsSolution } // simplified: assumes only one solution or toggles based on this one
            : t
        ));
         if (selectedThread && selectedThread.id === threadId) {
            setSelectedThread(st => st ? {...st, hasSolution: !currentIsSolution } : null); // Update viewed thread too
        }
    } catch (e: any) {
        setError(e.message || "Failed to update solution status.");
    } finally {
        setIsSubmittingReply(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeColor }: { title: string, value: string | number, icon: React.ElementType, change?: string, changeColor?: string }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{title}</CardTitle>
        <Icon className="h-5 w-5 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</div>
        {change && <p className={`text-xs ${changeColor || 'text-neutral-500 dark:text-neutral-400'} pt-1`}>{change}</p>}
      </CardContent>
    </Card>
  )

  if (isLoading && !threads.length) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <p className="ml-3 text-lg text-neutral-700 dark:text-neutral-300">Loading Forum...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Oops! Something went wrong.</h2>
        <p className="text-red-600 dark:text-red-400 text-center mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
          Try Reloading Page
        </Button>
      </div>
    )
  }

  const ForumThreadItem = ({ thread }: { thread: ForumThread }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-neutral-900 shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
    >
      <div className={`border-l-4 ${thread.category.colorCode || 'border-gray-300'}`}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {thread.isPinned && <TooltipProvider><Tooltip><TooltipTrigger><Pin className="h-4 w-4 text-orange-500" /></TooltipTrigger><TooltipContent><p>Pinned</p></TooltipContent></Tooltip></TooltipProvider>}
                {thread.isLocked && <TooltipProvider><Tooltip><TooltipTrigger><Lock className="h-4 w-4 text-red-500" /></TooltipTrigger><TooltipContent><p>Locked</p></TooltipContent></Tooltip></TooltipProvider>}
                {thread.hasSolution && <TooltipProvider><Tooltip><TooltipTrigger><CheckCircle className="h-4 w-4 text-green-500" /></TooltipTrigger><TooltipContent><p>Solved</p></TooltipContent></Tooltip></TooltipProvider>}
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${thread.category.colorCode}`}>
                  {thread.category.name}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer" onClick={() => setSelectedThread(thread)}>
                {thread.title}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-xl">
                <DropdownMenuItem onClick={() => fetchThreadDetails(thread.id)} className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800" disabled={isListActionLoading}>
                    <Eye className="mr-2 h-4 w-4" /> View Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditForumDialog(thread)} className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800" disabled={isListActionLoading}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePinThread(thread.id, thread.isPinned)} className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800" disabled={isListActionLoading}>
                  <Pin className="mr-2 h-4 w-4" /> {thread.isPinned ? "Unpin" : "Pin"} Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLockThread(thread.id, thread.isLocked)} className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800" disabled={isListActionLoading}>
                  <Lock className="mr-2 h-4 w-4" /> {thread.isLocked ? "Unlock" : "Lock"} Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openReportDialog("thread", thread.id)} className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800" disabled={isListActionLoading}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-500" /> Report Thread
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                <DropdownMenuItem onClick={() => handleDeleteThread(thread.id)} className="text-red-500 dark:text-red-400 hover:!bg-red-500/10 dark:hover:!bg-red-400/10 cursor-pointer focus:text-red-600 dark:focus:text-red-300" disabled={isListActionLoading}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Thread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-1 mb-3">
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={thread.author.avatarUrl} alt={thread.author.username} />
              <AvatarFallback className="text-xs">{thread.author.username.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{thread.author.username}</span>
            <span>•</span>
            <span>{formatDate(thread.createdAt)}</span>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3">
            {thread.content}
          </p>

          <div className="flex items-center space-x-1 mb-4">
            {thread.tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-normal">
                <TagIcon className="h-3 w-3 mr-1" />{tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" /> {thread.upvotes}</span>
              <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {thread.repliesCount}</span>
              <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {thread.views}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchThreadDetails(thread.id)} className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              View Replies ({thread.repliesCount})
            </Button>
          </div>
        </div>
         {thread.lastReplyAt && (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-5 py-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
              Last activity: {formatDate(thread.lastReplyAt)}
            </div>
          )}
      </div>
    </motion.div>
  )

  const ReplyItem = ({ reply }: { reply: ForumReply }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
            "p-4 rounded-md mb-3",
            reply.isSolution ? "bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500" : "bg-neutral-50 dark:bg-neutral-800/50"
        )}
    >
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={reply.author.avatarUrl} alt={reply.author.username} />
                    <AvatarFallback className="text-xs">{reply.author.username.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">{reply.author.username}</span>
                <span className="mx-1.5">•</span>
                <span>{formatDate(reply.createdAt)}</span>
                {reply.isSolution && <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 border-green-300 dark:border-green-600">Solution</Badge>}
            </div>
            {/* Admin actions for reply */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" disabled={isSubmittingReply}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-xl">
                    <DropdownMenuItem
                        onClick={() => handleMarkAsSolution(selectedThread!.id, reply.id, reply.isSolution)}
                        className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800"
                        disabled={isSubmittingReply}
                    >
                        <CheckCircle className={`mr-2 h-4 w-4 ${reply.isSolution ? 'text-yellow-500' : 'text-green-500'}`} />
                        {reply.isSolution ? "Unmark Solution" : "Mark as Solution"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => openReportDialog("reply", reply.id)}
                        className="cursor-pointer hover:!bg-neutral-100 dark:hover:!bg-neutral-800"
                        disabled={isSubmittingReply}
                    >
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-500" /> Report Reply
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                    <DropdownMenuItem
                        onClick={() => handleDeleteReply(selectedThread!.id, reply.id)}
                        className="text-red-500 dark:text-red-400 hover:!bg-red-500/10 dark:hover:!bg-red-400/10 cursor-pointer focus:text-red-600 dark:focus:text-red-300"
                        disabled={isSubmittingReply}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Reply
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2 whitespace-pre-wrap">{reply.content}</p>
        <div className="flex items-center space-x-3">
            <Button
                variant="ghost"
                size="sm"
                className="text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400 px-1"
                onClick={async () => { // Example: Inline upvote
                    setIsSubmittingReply(true); // or a specific upvote loading state
                    try {
                        const newUpvotes = await forumApi.upvoteReply(reply.id);
                        if (newUpvotes !== null) {
                            setSelectedThreadReplies(prev => prev.map(r => r.id === reply.id ? {...r, upvotes: newUpvotes} : r));
                        }
                    } catch(e:any) { console.error("Failed to upvote:", e); setError(e.message || "Failed to upvote reply.")}
                    finally { setIsSubmittingReply(false); }
                }}
                disabled={isSubmittingReply}
            >
                <ThumbsUp className="h-4 w-4 mr-1" /> {reply.upvotes}
            </Button>
            {/* TODO: Add a "Reply to this reply" button for threading if desired */}
        </div>
        {/* Render nested replies if any - recursive structure. Note: mockApi currently doesn't deeply support this well for updates. */}
        {reply.replies && reply.replies.length > 0 && (
            <div className="ml-6 mt-3 border-l-2 border-neutral-200 dark:border-neutral-700 pl-3">
                {reply.replies.map(nestedReply => <ReplyItem key={nestedReply.id} reply={nestedReply} />)}
            </div>
        )}
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 md:p-6 theme-transition">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">BDE Forum Management</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Oversee discussions, manage content, and engage with the community.</p>
          </div>
          <Dialog open={isCreateForumOpen} onOpenChange={setIsCreateForumOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all">
                <PlusCircle className="h-5 w-5 mr-2" /> Create New Forum
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-neutral-800 dark:text-neutral-100">Create New Forum Thread</DialogTitle>
                <DialogDescription className="text-neutral-500 dark:text-neutral-400">
                  Start a new discussion. Choose a relevant category and add descriptive tags.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Forum Title"
                  value={newForumTitle}
                  onChange={(e) => setNewForumTitle(e.target.value)}
                  className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                />
                <Select value={newForumCategory} onValueChange={setNewForumCategory}>
                  <SelectTrigger className="border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">
                        <div className="flex items-center">
                          <span className={`h-3 w-3 rounded-full mr-2 ${cat.colorCode}`}></span>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Forum Content (supports Markdown)"
                  value={newForumContent}
                  onChange={(e) => setNewForumContent(e.target.value)}
                  rows={6}
                  className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                />
                {/* Basic Tag Input (can be improved with a dedicated component) */}
                <Input
                  placeholder="Tags (comma-separated, e.g., important, announcement)"
                  value={newForumTags.join(", ")}
                  onChange={(e) => setNewForumTags(e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag))}
                  className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                />
                 {/* TODO: Replace basic tag input with a more advanced component (e.g., with suggestions from `allTags`) */}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" disabled={isListActionLoading}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateForumSubmit} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isListActionLoading || !newForumTitle || !newForumContent || !newForumCategory}>
                  {isListActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Thread
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Stats Overview */}
      {stats && !isLoading && ( // Ensure stats are shown only after initial load
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Threads" value={stats.totalThreads.toLocaleString()} icon={MessageSquare} change={stats.totalThreadsChange} changeColor="text-green-500 dark:text-green-400" />
            <StatCard title="Total Replies" value={stats.totalReplies.toLocaleString()} icon={Users} change={stats.totalRepliesChange} changeColor="text-green-500 dark:text-green-400"/>
            <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon={Activity} change={stats.activeUsersChange} /> {/* Potentially make this dynamic if API provides */}
            <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Today's Activity</CardTitle>
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                  {stats.todaysActivity.newThreads} New Threads
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                  {stats.todaysActivity.newReplies} New Replies
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Forum Controls and Filters */}
      <Card className="mb-6 p-4 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="search"
              placeholder="Search threads by keyword, tag, or content..."
              className="pl-10 pr-4 py-2 w-full border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectItem value="all" className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">
                  <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full mr-2 ${cat.colorCode}`}></span>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectItem value="latest_activity" className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">Latest Activity</SelectItem>
              <SelectItem value="creation_date" className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">Creation Date</SelectItem>
              <SelectItem value="most_replies" className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">Most Replies</SelectItem>
              <SelectItem value="most_upvotes" className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">Most Upvotes</SelectItem>
            </SelectContent>
          </Select>
        </div>
         {/* Quick filter buttons for categories */}
        <div className="mt-3 flex flex-wrap gap-2">
            <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                    "transition-all",
                    selectedCategory === "all" ? "bg-orange-500 text-white hover:bg-orange-600" : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                )}
            >
                All
            </Button>
            {categories.map(cat => (
                <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                        "transition-all",
                        selectedCategory === cat.id ? `${cat.colorCode} text-white hover:opacity-90` : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    )}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
      </Card>

      {/* Forum Threads List */}
      <div className="grid grid-cols-1 gap-5">
        <AnimatePresence>
          {isLoading && threads.length === 0 && ( /* This is covered by the main page loader */ null )}
          {!isLoading && filteredAndSortedThreads.length > 0 && (
            filteredAndSortedThreads.map(thread => (
              <ForumThreadItem key={thread.id} thread={thread} />
            ))
          )}
          {!isLoading && filteredAndSortedThreads.length === 0 && (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-1 flex flex-col items-center justify-center py-12 bg-white dark:bg-neutral-900 rounded-lg shadow"
              >
                <Info className="h-16 w-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No Threads Found</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-center">
                  There are no threads matching your current filters. Try adjusting your search or filter criteria.
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Dialog for Viewing Thread and Replies */}
      <AnimatePresence>
        {selectedThread && (
          <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
            <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
              <DialogHeader className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            {selectedThread.isPinned && <TooltipProvider><Tooltip><TooltipTrigger><Pin className="h-4 w-4 text-orange-500" /></TooltipTrigger><TooltipContent><p>Pinned</p></TooltipContent></Tooltip></TooltipProvider>}
                            {selectedThread.isLocked && <TooltipProvider><Tooltip><TooltipTrigger><Lock className="h-4 w-4 text-red-500" /></TooltipTrigger><TooltipContent><p>Locked</p></TooltipContent></Tooltip></TooltipProvider>}
                            {selectedThread.hasSolution && <TooltipProvider><Tooltip><TooltipTrigger><CheckCircle className="h-4 w-4 text-green-500" /></TooltipTrigger><TooltipContent><p>Solved</p></TooltipContent></Tooltip></TooltipProvider>}
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${selectedThread.category.colorCode}`}>
                            {selectedThread.category.name}
                            </span>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{selectedThread.title}</DialogTitle>
                        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-1 mt-1">
                            <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={selectedThread.author.avatarUrl} alt={selectedThread.author.username} />
                                <AvatarFallback className="text-xs">{selectedThread.author.username.substring(0,1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{selectedThread.author.username}</span>
                            <span>•</span>
                            <span>{formatDate(selectedThread.createdAt)}</span>
                            <span className="mx-1">•</span>
                            <span className="flex items-center"><ThumbsUp className="h-3 w-3 mr-0.5" /> {selectedThread.upvotes}</span>
                            <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-0.5" /> {selectedThread.repliesCount}</span>
                            <span className="flex items-center"><Eye className="h-3 w-3 mr-0.5" /> {selectedThread.views}</span>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 -mt-2 -mr-2">
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                </div>
              </DialogHeader>

              <div className="p-6 flex-grow overflow-y-auto">
                {isViewThreadLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        <p className="ml-2">Loading thread content...</p>
                    </div>
                ) : (
                    <>
                        <div className="prose prose-sm dark:prose-invert max-w-none mb-6 text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                          {/* In a real app, parse and render Markdown content safely e.g. using react-markdown */}
                          {/* For now, simple paragraph. Ensure content is sanitized if from users. */}
                          {selectedThread.content}
                        </div>

                        <div className="flex items-center space-x-1 mb-6">
                            {selectedThread.tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-normal">
                                <TagIcon className="h-3 w-3 mr-1" />{tag.name}
                            </Badge>
                            ))}
                        </div>

                        <h4 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-100">Replies ({selectedThreadReplies.length || 0})</h4>
                        <AnimatePresence>
                        {selectedThreadReplies && selectedThreadReplies.length > 0 ? (
                          selectedThreadReplies.map(reply => <ReplyItem key={reply.id} reply={reply} />)
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">No replies yet.</p>
                        )}
                        </AnimatePresence>
                    </>
                )}
              </div>

              {!selectedThread.isLocked && !isViewThreadLoading && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-md font-semibold mb-2 text-neutral-800 dark:text-neutral-100">Post a Reply</h4>
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="mb-3 border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                    disabled={isSubmittingReply}
                  />
                  <div className="flex justify-end">
                    <Button onClick={() => handlePostReply(selectedThread.id)} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={!replyContent || isSubmittingReply}>
                      {isSubmittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Post Reply
                    </Button>
                  </div>
                </div>
              )}
              {selectedThread.isLocked && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
                    <Lock className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-500 dark:text-red-400 font-medium">This thread is locked. No new replies can be posted.</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* TODO: Add pagination if many threads */}

      {/* Report Content Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={(isOpen) => {
          setIsReportDialogOpen(isOpen);
          if (!isOpen) {
            setError(null);
            setReportingContent(null); // Clear reporting content when dialog is closed
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-neutral-800 dark:text-neutral-100">Report Content</DialogTitle>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400">
              Please provide a reason for reporting this {reportingContent?.type}.
              Your report will be reviewed by moderators.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={`Reason for reporting this ${reportingContent?.type}...`}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
              disabled={isSubmittingReport}
            />
            {error && reportingContent && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button
                variant="outline"
                onClick={() => { setIsReportDialogOpen(false); setError(null); }}
                className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                disabled={isSubmittingReport}
            >
                Cancel
            </Button>
            <Button
                onClick={handleReportSubmit}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isSubmittingReport || !reportReason}
            >
              {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Thread Dialog */}
      <Dialog open={isEditForumOpen} onOpenChange={(isOpen) => {
          setIsEditForumOpen(isOpen);
          if (!isOpen) {
            setError(null);
            setEditingThread(null); // Clear editing thread when dialog is closed
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-neutral-800 dark:text-neutral-100">Edit Forum Thread</DialogTitle>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400">
              Modify the details of this forum thread.
            </DialogDescription>
          </DialogHeader>
          {editingThread && (
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Forum Title"
                value={editForumTitle}
                onChange={(e) => setEditForumTitle(e.target.value)}
                className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                disabled={isSubmittingEdit}
              />
              <Select value={editForumCategory} onValueChange={setEditForumCategory} disabled={isSubmittingEdit}>
                <SelectTrigger className="border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="hover:!bg-neutral-100 dark:hover:!bg-neutral-700">
                      <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${cat.colorCode}`}></span>
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Forum Content (supports Markdown)"
                value={editForumContent}
                onChange={(e) => setEditForumContent(e.target.value)}
                rows={6}
                className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                disabled={isSubmittingEdit}
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={editForumTags.join(", ")}
                onChange={(e) => setEditForumTags(e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag))}
                className="text-base border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500"
                disabled={isSubmittingEdit}
              />
               {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button
                variant="outline"
                onClick={() => { setIsEditForumOpen(false); setError(null); }}
                className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                disabled={isSubmittingEdit}
            >
                Cancel
            </Button>
            <Button
                onClick={handleEditForumSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSubmittingEdit || !editForumTitle || !editForumContent || !editForumCategory}
            >
              {isSubmittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
