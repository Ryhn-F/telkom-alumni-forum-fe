// ==================== Role ====================
export interface Role {
  id: number;
  name: "admin" | "guru" | "siswa";
  description: string;
  created_at: string;
}

// ==================== User ====================
export interface User {
  id: string;
  username: string;
  email: string;
  role_id: number;
  role?: Role;
  avatar_url?: string;
  created_at: string;
}

// ==================== Profile ====================
export interface Profile {
  user_id: string;
  full_name: string;
  identity_number?: string;
  class_grade?: string;
  bio?: string;
  created_at: string;
}

// ==================== Combined User Data ====================
export interface UserWithProfile {
  user: User;
  role: Role;
  profile: Profile;
}

// ==================== Auth ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  role: Role;
  profile: Profile;
  search_token: string;
}

// ==================== Category ====================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryListResponse {
  data: Category[];
  meta: {
    total_items: number;
  };
}

// ==================== Attachment ====================
export interface Attachment {
  id: number;
  file_url: string;
  file_type: string;
}

export interface UploadResponse {
  id: number;
  file_url: string;
  file_type: string;
}

// ==================== Author ====================
export interface Author {
  username: string;
  avatar_url?: string;
}

// ==================== Thread ====================
export interface Thread {
  id: string;
  category_name: string;
  title: string;
  slug: string;
  content: string;
  audience: "semua" | "guru" | "siswa";
  views: number;
  author: Author;
  likes_count?: number;
  is_liked?: boolean;
  attachments: Attachment[];
  created_at: string;
}

export interface ThreadListResponse {
  data: Thread[];
  meta: PaginationMeta;
}

export interface CreateThreadRequest {
  category_id: string;
  title: string;
  content: string;
  audience: "semua" | "guru" | "siswa";
  attachment_ids?: number[];
}

export type UpdateThreadRequest = CreateThreadRequest;

// ==================== Post (Reply) ====================
export interface PostParent {
  id: string;
  content: string;
  author: Author;
}

export interface Post {
  id: string;
  thread_id: string;
  parent_id?: string | null;
  parent?: PostParent;  // Populated when API returns parent post data
  content: string;
  author: Author;
  likes_count?: number;
  is_liked?: boolean;
  attachments: Attachment[];
  created_at: string;
  replies?: Post[];
}

export interface PostListResponse {
  data: Post[];
  meta: PaginationMeta;
}

export interface CreatePostRequest {
  content: string;
  parent_id?: string;
  attachment_ids?: number[];
}

export interface UpdatePostRequest {
  content: string;
  attachment_ids?: number[];
}

// ==================== Pagination ====================
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  limit: number;
}

// ==================== Admin User Management ====================
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: "admin" | "guru" | "siswa";
  full_name: string;
  identity_number?: string;
  class_grade?: string;
  bio?: string;
  avatar?: File;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: "admin" | "guru" | "siswa";
  full_name?: string;
  identity_number?: string;
  class_grade?: string;
  bio?: string;
  avatar?: File;
}

export interface UserListResponse {
  data: UserWithProfile[];
}

// ==================== Category Management ====================
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

// ==================== Profile Update ====================
export interface UpdateProfileRequest {
  username?: string;
  password?: string;
  bio?: string;
  avatar?: File;
}

// ==================== Public Profile ====================
export interface PublicProfile {
  username: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  class_grade?: string;
  bio?: string;
}

// ==================== API Response Wrappers ====================
export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

// ==================== Query Parameters ====================
export interface ThreadQueryParams {
  category_id?: string;
  search?: string;
  audience?: "semua" | "guru" | "siswa";
  sort_by?: "popular" | "newest";
  page?: number;
  limit?: number;
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
}

export interface CategoryQueryParams {
  search?: string;
}

// ==================== Notification ====================
export interface NotificationActor {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  entity_id: string;
  entity_type: "thread" | "post" | "gamification";
  entity_slug: string;
  type: "reply_post" | "reply_thread" | "like_thread" | "like_post" | "rank_up";
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: NotificationActor;
}

export interface NotificationListResponse {
  data: Notification[];
}

export interface NotificationUnreadCountResponse {
  count: number;
}

export interface UserCountResponse {
  total_users: number;
}

export interface NotificationQueryParams {
  limit?: number;
  offset?: number;
}

// ==================== Meilisearch ====================
export interface MeilisearchUser {
  username: string;
  avatar_url?: string;
}

export interface MeilisearchCategory {
  name: string;
}

export interface MeilisearchThread {
  id: string;
  title: string;
  content: string;
  slug: string;
  audience: string;
  allowed_roles?: string[];
  views: number;
  likes_count?: number;
  created_at: number;
  category_id: string;
  user: MeilisearchUser;
  category: MeilisearchCategory;
  _formatted?: {
    title?: string;
    content?: string;
  };
}

export interface MeilisearchPost {
  id: string;
  thread_id: string;
  thread_slug: string;
  thread_title: string;
  content: string;
  parent_id?: string;
  allowed_roles?: string[];
  likes_count?: number;
  created_at: number;
  user: MeilisearchUser;
  _formatted?: {
    content?: string;
  };
}

// Separate result types for threads and posts since their response formats differ
export interface MeilisearchThreadResult {
  results: MeilisearchThread[];
  query?: string;
  limit: number;
  offset: number;
  total: number;
}

export interface MeilisearchPostResult {
  hits: MeilisearchPost[];
  query?: string;
  processingTimeMs?: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

// ==================== Menfess ====================
export interface Menfess {
  id: string;
  content: string;
  created_at: string;
}

export interface MenfessListResponse {
  data: Menfess[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Gamification ====================
export interface GamificationStatus {
  // All-Time Rank (Permanent)
  rank_name: string;
  next_rank: string;
  current_points: number;
  target_points: number;
  progress: number;
  // Weekly Activity Context
  weekly_points?: number;
  weekly_label?: string;
}

// ==================== Public Profile (Updated) ====================
export interface PublicProfile {
  username: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  class_grade?: string;
  bio?: string;
  gamification_status?: GamificationStatus;
}

// ==================== My Profile Response ====================
export interface MyProfileResponse {
  user: User;
  role: Role;
  profile: Profile;
  gamification_status?: GamificationStatus;
}

// ==================== Leaderboard ====================
export interface LeaderboardEntry {
  username: string;
  avatar_url?: string | null;
  role: string;
  position: number;
  gamification_status: GamificationStatus;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

export type LeaderboardTimeframe = "all_time" | "weekly";

