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

// ==================== Thread ====================
export interface Thread {
  id: string;
  category_name: string;
  title: string;
  slug: string;
  content: string;
  audience: "semua" | "guru" | "siswa";
  views: number;
  author: string;
  author_avatar?: string;
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
export interface Post {
  id: string;
  thread_id: string;
  parent_id?: string | null;
  content: string;
  author: string;
  author_avatar?: string;
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
