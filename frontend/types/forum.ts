// frontend/types/forum.ts

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  // Add other relevant user fields if needed, e.g., role
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  colorCode: string; // For category color coding
  // Add other relevant category fields if needed, e.g., icon
}

export interface Tag {
  id: string;
  name: string;
}

export interface ForumReply {
  id: string;
  content: string;
  author: UserProfile;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  upvotes: number;
  isSolution: boolean;
  parentId?: string | null; // For threaded replies
  replies?: ForumReply[]; // Nested replies
  // Add other relevant reply fields if needed, e.g., reports
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: UserProfile;
  category: ForumCategory;
  tags: Tag[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  views: number;
  upvotes: number;
  repliesCount: number;
  isPinned: boolean;
  isLocked: boolean; // aka isClosed
  hasSolution?: boolean; // Derived from replies, or a direct field
  lastReplyAt?: string | null; // ISO date string, for sorting by recent activity
  replies?: ForumReply[]; // Initially might be a snippet or empty, loaded on demand
  // Add other relevant thread fields if needed, e.g., reports
}

// For the main forum page data, which might include threads and categories
export interface ForumPageData {
  threads: ForumThread[];
  categories: ForumCategory[];
  // Add other relevant data like popular tags, etc.
}

// For forum statistics
export interface ForumStats {
  totalThreads: number;
  totalThreadsChange?: string; // e.g., "+5%"
  totalReplies: number;
  totalRepliesChange?: string;
  activeUsers: number;
  activeUsersChange?: string;
  todaysActivity: {
    newThreads: number;
    newReplies: number;
  };
}

// For creating/editing a forum thread
export interface ForumThreadPayload {
  title: string;
  content: string;
  categoryId: string;
  tagIds?: string[]; // or array of strings if creating new tags
}

// For creating/editing a reply
export interface ForumReplyPayload {
  content: string;
  parentId?: string | null;
}

// For reporting content
export interface ReportPayload {
  contentId: string; // ID of the thread or reply
  contentType: 'thread' | 'reply';
  reason: string;
  // Add other relevant report fields if needed
}
