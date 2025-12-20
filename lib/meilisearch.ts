import { getSearchToken } from "./cookies";
import type {
  MeilisearchThread,
  MeilisearchPost,
  MeilisearchThreadResult,
  MeilisearchPostResult,
} from "@/types";

const MEILISEARCH_HOST =
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://localhost:7700";

interface SearchOptions {
  limit?: number;
  offset?: number;
  filter?: string;
  attributesToHighlight?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
}

export async function searchThreads(
  query: string,
  options: SearchOptions = {}
): Promise<MeilisearchThreadResult> {
  const searchToken = getSearchToken();

  if (!searchToken) {
    throw new Error("Search token not found. Please login first.");
  }

  const {
    limit = 10,
    offset = 0,
    filter,
    attributesToHighlight = ["title", "content"],
    highlightPreTag = "<mark>",
    highlightPostTag = "</mark>",
  } = options;

  const body: Record<string, unknown> = {
    q: query,
    limit,
    offset,
    attributesToHighlight,
    highlightPreTag,
    highlightPostTag,
  };

  if (filter) {
    body.filter = filter;
  }

  const response = await fetch(
    `${MEILISEARCH_HOST}/indexes/threads/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${searchToken}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Search failed with status ${response.status}`);
  }

  const data = await response.json();
  
  // Normalize response - threads use 'results' and 'total'
  return {
    results: data.results || data.hits || [],
    query: data.query,
    limit: data.limit,
    offset: data.offset,
    total: data.total ?? data.estimatedTotalHits ?? 0,
  };
}

export async function searchPosts(
  query: string,
  options: SearchOptions = {}
): Promise<MeilisearchPostResult> {
  const searchToken = getSearchToken();

  if (!searchToken) {
    throw new Error("Search token not found. Please login first.");
  }

  const {
    limit = 10,
    offset = 0,
    filter,
    attributesToHighlight = ["content"],
    highlightPreTag = "<mark>",
    highlightPostTag = "</mark>",
  } = options;

  const body: Record<string, unknown> = {
    q: query,
    limit,
    offset,
    attributesToHighlight,
    highlightPreTag,
    highlightPostTag,
  };

  if (filter) {
    body.filter = filter;
  }

  const response = await fetch(
    `${MEILISEARCH_HOST}/indexes/posts/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${searchToken}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Search failed with status ${response.status}`);
  }

  const data = await response.json();
  
  // Posts use 'hits' and 'estimatedTotalHits'
  return {
    hits: data.hits || data.results || [],
    query: data.query,
    processingTimeMs: data.processingTimeMs,
    limit: data.limit,
    offset: data.offset,
    estimatedTotalHits: data.estimatedTotalHits ?? data.total ?? 0,
  };
}

export interface MultiSearchResult {
  threads: MeilisearchThreadResult;
  posts: MeilisearchPostResult;
}

export async function searchAll(
  query: string,
  options: SearchOptions = {}
): Promise<MultiSearchResult> {
  // Fetch both indexes in parallel
  const [threads, posts] = await Promise.all([
    searchThreads(query, options),
    searchPosts(query, options),
  ]);

  return { threads, posts };
}
