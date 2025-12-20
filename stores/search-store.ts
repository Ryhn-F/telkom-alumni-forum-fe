import { create } from "zustand";
import {
  searchAll,
  searchThreads,
  searchPosts,
  MultiSearchResult,
} from "@/lib/meilisearch";
import type {
  MeilisearchThreadResult,
  MeilisearchPostResult,
} from "@/types";

interface SearchState {
  // Search query
  query: string;
  
  // Results
  threads: MeilisearchThreadResult | null;
  posts: MeilisearchPostResult | null;
  
  // Pagination
  threadsOffset: number;
  postsOffset: number;
  limit: number;
  
  // Loading states
  isSearching: boolean;
  isLoadingMoreThreads: boolean;
  isLoadingMorePosts: boolean;
  
  // Error
  error: string | null;
  
  // Active tab
  activeTab: "all" | "threads" | "posts";
  
  // Actions
  setQuery: (query: string) => void;
  setActiveTab: (tab: "all" | "threads" | "posts") => void;
  search: (query: string) => Promise<void>;
  searchThreadsOnly: (query: string) => Promise<void>;
  searchPostsOnly: (query: string) => Promise<void>;
  loadMoreThreads: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: "",
  threads: null,
  posts: null,
  threadsOffset: 0,
  postsOffset: 0,
  limit: 10,
  isSearching: false,
  isLoadingMoreThreads: false,
  isLoadingMorePosts: false,
  error: null,
  activeTab: "all",

  setQuery: (query) => set({ query }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  search: async (query) => {
    if (!query.trim()) {
      set({ threads: null, posts: null, error: null });
      return;
    }

    set({ isSearching: true, error: null, query, threadsOffset: 0, postsOffset: 0 });
    
    try {
      const results: MultiSearchResult = await searchAll(query, { limit: get().limit });
      set({
        threads: results.threads,
        posts: results.posts,
        isSearching: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Pencarian gagal",
        isSearching: false,
      });
    }
  },

  searchThreadsOnly: async (query) => {
    if (!query.trim()) {
      set({ threads: null, error: null });
      return;
    }

    set({ isSearching: true, error: null, query, threadsOffset: 0 });
    
    try {
      const results = await searchThreads(query, { limit: get().limit });
      set({
        threads: results,
        isSearching: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Pencarian gagal",
        isSearching: false,
      });
    }
  },

  searchPostsOnly: async (query) => {
    if (!query.trim()) {
      set({ posts: null, error: null });
      return;
    }

    set({ isSearching: true, error: null, query, postsOffset: 0 });
    
    try {
      const results = await searchPosts(query, { limit: get().limit });
      set({
        posts: results,
        isSearching: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Pencarian gagal",
        isSearching: false,
      });
    }
  },

  loadMoreThreads: async () => {
    const { query, threads, threadsOffset, limit } = get();
    if (!threads || threads.results.length >= threads.total) return;

    set({ isLoadingMoreThreads: true });
    
    try {
      const newOffset = threadsOffset + limit;
      const results = await searchThreads(query, { limit, offset: newOffset });
      set({
        threads: {
          ...results,
          results: [...threads.results, ...results.results],
        },
        threadsOffset: newOffset,
        isLoadingMoreThreads: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Gagal memuat lebih banyak thread",
        isLoadingMoreThreads: false,
      });
    }
  },

  loadMorePosts: async () => {
    const { query, posts, postsOffset, limit } = get();
    if (!posts || posts.hits.length >= posts.estimatedTotalHits) return;

    set({ isLoadingMorePosts: true });
    
    try {
      const newOffset = postsOffset + limit;
      const results = await searchPosts(query, { limit, offset: newOffset });
      set({
        posts: {
          ...results,
          hits: [...posts.hits, ...results.hits],
        },
        postsOffset: newOffset,
        isLoadingMorePosts: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Gagal memuat lebih banyak balasan",
        isLoadingMorePosts: false,
      });
    }
  },

  clearResults: () =>
    set({
      query: "",
      threads: null,
      posts: null,
      threadsOffset: 0,
      postsOffset: 0,
      error: null,
    }),
}));
