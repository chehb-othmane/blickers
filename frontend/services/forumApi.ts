// frontend/services/forumApi.ts
import type {
  ForumThread,
  ForumCategory,
  ForumStats,
  ForumReply,
  Tag,
  UserProfile,
  ForumThreadPayload,
  ForumReplyPayload,
  ReportPayload,
} from "@/types/forum";

// Simulate API delay
const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data (can be expanded and moved to a separate mock data file if it grows too large)
const mockUser: UserProfile = { id: "user1", username: "AdminUser", avatarUrl: "/placeholder.svg?height=40&width=40" };
const mockUsers: UserProfile[] = [
    mockUser,
    { id: "user2", username: "JaneDoe", avatarUrl: "/placeholder.svg?height=30&width=30" },
    { id: "user3", username: "JohnSmith", avatarUrl: "/placeholder.svg?height=30&width=30" },
    { id: "user4", username: "TechGuru", avatarUrl: "/placeholder.svg?height=40&width=40" },
    { id: "user5", username: "UXFan", avatarUrl: "/placeholder.svg?height=40&width=40" },
];

const mockCategoriesData: ForumCategory[] = [
  { id: "cat1", name: "General Discussion", description: "Talk about anything and everything.", colorCode: "bg-blue-500" },
  { id: "cat2", name: "Technical Support", description: "Get help with technical issues.", colorCode: "bg-green-500" },
  { id: "cat3", name: "Feature Requests", description: "Suggest new features or improvements.", colorCode: "bg-yellow-500" },
  { id: "cat4", name: "Off-Topic", description: "For discussions not related to other categories.", colorCode: "bg-purple-500" },
];

const mockTagsData: Tag[] = [
  { id: "tag1", name: "bug" },
  { id: "tag2", name: "frontend" },
  { id: "tag3", name: "api" },
  { id: "tag4", name: "suggestion" },
  { id: "tag5", name: "help" },
];

let mockThreadsData: ForumThread[] = [
  {
    id: "thread1",
    title: "Welcome to the New Forum!",
    content: "This is the first thread in our new forum. Feel free to introduce yourselves and share your thoughts. Markdown is supported for formatting your posts. \n\nFor example, you can use **bold text**, *italic text*, `inline code`, and lists:\n\n- Item 1\n- Item 2\n\n```javascript\nconsole.log('Hello, forum!');\n```",
    author: mockUsers[0],
    category: mockCategoriesData[0],
    tags: [mockTagsData[3]],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 125,
    upvotes: 42,
    repliesCount: 2,
    isPinned: true,
    isLocked: false,
    hasSolution: true,
    lastReplyAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      { id: "reply1-1", content: "Great initiative! Excited to be here.", author: mockUsers[1], createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString(), upvotes: 10, isSolution: true, parentId: null, replies: [] },
      { id: "reply1-2", content: "Looking forward to engaging discussions. The platform looks great!", author: mockUsers[2], createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(), upvotes: 5, isSolution: false, parentId: null, replies: [] },
    ]
  },
  {
    id: "thread2",
    title: "Issue with API endpoint /users - Getting 500 Error",
    content: "I'm consistently experiencing a 500 internal server error when trying to access the `/users` endpoint with a GET request. This started happening after the last update. \n\nIs anyone else facing this? Any known workarounds or fixes in progress?",
    author: mockUsers[3],
    category: mockCategoriesData[1],
    tags: [mockTagsData[0], mockTagsData[2]],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    views: 78,
    upvotes: 15,
    repliesCount: 1,
    isPinned: false,
    isLocked: false,
    hasSolution: false,
    lastReplyAt: new Date(Date.now() - 1800000).toISOString(),
    replies: [
        { id: "reply2-1", content: "We are aware of this issue and are working on a fix. Expect an update soon.", author: mockUsers[0], createdAt: new Date(Date.now() - 1800000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString(), upvotes: 3, isSolution: false, parentId: null, replies: [] }
    ]
  },
  {
    id: "thread3",
    title: "Suggestion: Dark Mode for the entire platform for better UX",
    content: "It would be a fantastic improvement to have a consistent dark mode available across all sections of the platform, not just the admin dashboard. This would greatly enhance user experience, especially for those who prefer darker interfaces or work in low-light environments. Many modern applications offer this, and it's become a highly requested feature.",
    author: mockUsers[4],
    category: mockCategoriesData[2],
    tags: [mockTagsData[1], mockTagsData[3]],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 210,
    upvotes: 88,
    repliesCount: 0,
    isPinned: false,
    isLocked: true,
    hasSolution: false,
    lastReplyAt: null,
    replies: []
  },
];

const mockStatsData: ForumStats = {
  totalThreads: mockThreadsData.length,
  totalThreadsChange: "+2", // Example change
  totalReplies: mockThreadsData.reduce((sum, t) => sum + (t.replies?.length || 0), 0),
  totalRepliesChange: "+5", // Example change
  activeUsers: 230, // Static for now
  activeUsersChange: "+5%", // Static for now
  todaysActivity: {
    newThreads: 1, // Example
    newReplies: 3, // Example
  },
};

// This would be your actual API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const forumApi = {
  // THREADS
  getThreads: async (): Promise<ForumThread[]> => {
    await apiDelay(700);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/threads`);
    // In a real API, you might not fetch all replies here, just reply counts.
    // Or fetch paginated replies.
    return JSON.parse(JSON.stringify(mockThreadsData.map(t => ({...t, replies: undefined})))); // Don't send full replies in list view
  },

  getThreadById: async (threadId: string): Promise<ForumThread | null> => {
    await apiDelay(500);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/threads/${threadId}`);
    const thread = mockThreadsData.find(t => t.id === threadId);
    return thread ? JSON.parse(JSON.stringify(thread)) : null;
  },

  createThread: async (payload: ForumThreadPayload): Promise<ForumThread> => {
    await apiDelay(1000);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/threads`, payload);
    const category = mockCategoriesData.find(c => c.id === payload.categoryId);
    if (!category) throw new Error("Category not found");

    const newThread: ForumThread = {
      id: `thread${Date.now()}`,
      title: payload.title,
      content: payload.content,
      author: mockUser, // Assuming current user is mockUser for simplicity
      category,
      tags: payload.tagIds?.map(id => mockTagsData.find(t=>t.id === id) || {id:id, name:id}) || [], // Simplistic tag handling
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      upvotes: 0,
      repliesCount: 0,
      isPinned: false,
      isLocked: false,
      hasSolution: false,
      replies: [],
    };
    mockThreadsData = [newThread, ...mockThreadsData];
    mockStatsData.totalThreads++;
    return JSON.parse(JSON.stringify(newThread));
  },

  updateThread: async (threadId: string, payload: Partial<ForumThreadPayload>): Promise<ForumThread | null> => {
    await apiDelay(700);
    console.log(`[ForumAPI MOCK] PUT ${API_BASE_URL}/forum/threads/${threadId}`, payload);
    let thread = mockThreadsData.find(t => t.id === threadId);
    if (thread) {
      thread = { ...thread, ...payload, updatedAt: new Date().toISOString() };
      if (payload.categoryId) {
        thread.category = mockCategoriesData.find(c => c.id === payload.categoryId) || thread.category;
      }
      mockThreadsData = mockThreadsData.map(t => t.id === threadId ? thread! : t);
      return JSON.parse(JSON.stringify(thread));
    }
    return null;
  },

  deleteThread: async (threadId: string): Promise<void> => {
    await apiDelay(500);
    console.log(`[ForumAPI MOCK] DELETE ${API_BASE_URL}/forum/threads/${threadId}`);
    const initialLength = mockThreadsData.length;
    mockThreadsData = mockThreadsData.filter(t => t.id !== threadId);
    if (mockThreadsData.length < initialLength) {
        mockStatsData.totalThreads--;
    }
  },

  // REPLIES
  getRepliesForThread: async (threadId: string): Promise<ForumReply[]> => {
    await apiDelay(400);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/threads/${threadId}/replies`);
    const thread = mockThreadsData.find(t => t.id === threadId);
    return thread && thread.replies ? JSON.parse(JSON.stringify(thread.replies)) : [];
  },

  createReply: async (threadId: string, payload: ForumReplyPayload): Promise<ForumReply | null> => {
    await apiDelay(800);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/threads/${threadId}/replies`, payload);
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread && !thread.isLocked) {
      const newReply: ForumReply = {
        id: `reply${Date.now()}`,
        content: payload.content,
        author: mockUsers[Math.floor(Math.random() * mockUsers.length)], // Random author for mock
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        upvotes: 0,
        isSolution: false,
        parentId: payload.parentId || null,
        replies: [] // For nested replies
      };
      if (payload.parentId) {
        // Find parent reply and add to its nested replies (simplified)
        const findAndAddReply = (replies: ForumReply[]): boolean => {
            for (let i=0; i<replies.length; i++) {
                if (replies[i].id === payload.parentId) {
                    replies[i].replies = [...(replies[i].replies || []), newReply];
                    return true;
                }
                if (replies[i].replies && findAndAddReply(replies[i].replies!)) return true;
            }
            return false;
        }
        findAndAddReply(thread.replies || []);
      } else {
        thread.replies = [...(thread.replies || []), newReply];
      }
      thread.repliesCount = (thread.replies?.length || 0) + (thread.replies?.reduce((acc, r) => acc + (r.replies?.length || 0), 0) || 0); // Recalculate (simplified)
      thread.lastReplyAt = newReply.createdAt;
      mockStatsData.totalReplies++;
      return JSON.parse(JSON.stringify(newReply));
    }
    return null;
  },

  deleteReply: async (threadId: string, replyId: string): Promise<void> => {
    await apiDelay(500);
    console.log(`[ForumAPI MOCK] DELETE ${API_BASE_URL}/forum/replies/${replyId}`);
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread && thread.replies) {
      const initialLength = thread.replies.length; // Simplified, doesn't account for nested

      const removeReplyRecursively = (replies: ForumReply[]): ForumReply[] => {
        return replies.filter(reply => {
          if (reply.id === replyId) {
            return false;
          }
          if (reply.replies && reply.replies.length > 0) {
            reply.replies = removeReplyRecursively(reply.replies);
          }
          return true;
        });
      };
      thread.replies = removeReplyRecursively(thread.replies);
      thread.repliesCount = thread.replies.length; // Simplified count
      if (thread.replies.length < initialLength) {
        mockStatsData.totalReplies--;
      }
       // Update hasSolution status if the deleted reply was a solution
      const solutionReply = thread.replies.find(r => r.isSolution);
      if (!solutionReply) {
        thread.hasSolution = false;
      }
    }
  },

  // CATEGORIES & TAGS
  getCategories: async (): Promise<ForumCategory[]> => {
    await apiDelay(300);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/categories`);
    return JSON.parse(JSON.stringify(mockCategoriesData));
  },

  getTags: async (): Promise<Tag[]> => {
    await apiDelay(200);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/tags`);
    return JSON.parse(JSON.stringify(mockTagsData));
  },

  // STATS
  getStats: async (): Promise<ForumStats> => {
    await apiDelay(600);
    console.log(`[ForumAPI MOCK] GET ${API_BASE_URL}/forum/stats`);
    // Recalculate some stats based on current mockThreadsData
    mockStatsData.totalThreads = mockThreadsData.length;
    mockStatsData.totalReplies = mockThreadsData.reduce((sum, t) => sum + (t.replies?.length || 0) + (t.replies?.reduce((acc, r) => acc + (r.replies?.length || 0), 0) || 0),0);
    return JSON.parse(JSON.stringify(mockStatsData));
  },

  // INTERACTIONS & MODERATION
  upvoteThread: async (threadId: string): Promise<number | null> => {
    await apiDelay(300);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/threads/${threadId}/upvote`);
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread) {
      thread.upvotes += 1;
      return thread.upvotes;
    }
    return null;
  },

  upvoteReply: async (replyId: string): Promise<number | null> => {
    await apiDelay(300);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/replies/${replyId}/upvote`);
    // Find the reply (can be nested)
    let foundReply: ForumReply | null = null;
    const findReply = (replies: ForumReply[]) => {
        for (const reply of replies) {
            if (reply.id === replyId) { foundReply = reply; return; }
            if (reply.replies) findReply(reply.replies);
            if (foundReply) return;
        }
    }
    mockThreadsData.forEach(t => { if (t.replies && !foundReply) findReply(t.replies) });

    if (foundReply) {
      foundReply.upvotes += 1;
      return foundReply.upvotes;
    }
    return null;
  },

  markReplyAsSolution: async (threadId: string, replyId: string, isSolution: boolean): Promise<void> => {
    await apiDelay(400);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/replies/${replyId}/solution`, { isSolution });
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread && thread.replies) {
      let solutionChanged = false;
      thread.replies.forEach(r => {
        // Unmark other solutions if setting a new one
        if (isSolution && r.id !== replyId && r.isSolution) {
          r.isSolution = false;
        }
        if (r.id === replyId) {
          r.isSolution = isSolution;
          solutionChanged = true;
        }
        // Could also check nested replies if solutions can be nested.
      });
      if (solutionChanged) {
        thread.hasSolution = thread.replies.some(r => r.isSolution);
      }
    }
  },

  pinThread: async (threadId: string, isPinned: boolean): Promise<void> => {
    await apiDelay(300);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/threads/${threadId}/pin`, { isPinned });
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread) {
      thread.isPinned = isPinned;
    }
  },

  lockThread: async (threadId: string, isLocked: boolean): Promise<void> => {
    await apiDelay(300);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/threads/${threadId}/lock`, { isLocked });
    const thread = mockThreadsData.find(t => t.id === threadId);
    if (thread) {
      thread.isLocked = isLocked;
    }
  },

  reportContent: async (payload: ReportPayload): Promise<void> => {
    await apiDelay(600);
    console.log(`[ForumAPI MOCK] POST ${API_BASE_URL}/forum/report`, payload);
    // In a real app, this would save the report to the database.
    // For mock, we just log it.
    console.log(`Reported ${payload.contentType} ID ${payload.contentId} for: ${payload.reason}`);
  },
};

// NOTE: This is a mock API service. In a real application, these functions
// would use `fetch` or a library like `axios` to make HTTP requests to the backend.
// Error handling, request/response types, and authentication would also be more robust.
// The NEXT_PUBLIC_API_URL should be configured in your .env files.
// Example of a real fetch call structure (replace mock logic):
//
// async getThreads(): Promise<ForumThread[]> {
//   const response = await fetch(`${API_BASE_URL}/forum/threads`);
//   if (!response.ok) {
//     throw new Error(`API error: ${response.statusText}`);
//   }
//   return response.json();
// },
//
// Remember to handle loading states and errors in your components when calling these.
// For file uploads (e.g. attachments), you'd use FormData.
// Authentication headers (e.g., JWT tokens) would typically be added in a fetch wrapper or interceptor.
// Consider using a data fetching library like SWR or React Query for caching, refetching, etc.
// for a more robust frontend experience.
// frontend/services/forumApi.ts
// ... (rest of the mock data and functions)
// ...
// updateReply, searchThreads, etc. can be added here.
// For example:
// updateReply: async (replyId: string, payload: Partial<Pick<ForumReply, 'content'>>): Promise<ForumReply | null> => { ... }
// searchThreads: async (query: string, categoryId?: string, tagIds?: string[]): Promise<ForumThread[]> => { ... }
