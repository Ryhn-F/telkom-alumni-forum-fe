import { MetadataRoute } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface ThreadItem {
  id: string;
  slug: string;
  created_at: string;
}

interface ThreadResponse {
  data: ThreadItem[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${APP_BASE_URL}/threads`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${APP_BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${APP_BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  try {
    const res = await fetch(`${API_BASE_URL}/api/threads?page=1&limit=100`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data: ThreadResponse = await res.json();
      const threadPages: MetadataRoute.Sitemap = (data.data || []).map(
        (thread) => ({
          url: `${APP_BASE_URL}/threads/${thread.slug || thread.id}`,
          lastModified: thread.created_at ? new Date(thread.created_at) : new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        })
      );

      return [...staticPages, ...threadPages];
    }
  } catch (err) {
    console.error("Failed to generate sitemap for threads:", err);
  }

  return staticPages;
}
