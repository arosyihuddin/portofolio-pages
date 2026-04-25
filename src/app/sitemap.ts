import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";

export default async function sitemap() {
  const base = DATA.url.replace(/\/$/, "");

  const routes = ["", "/blog"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const posts = await getBlogPosts();
    const postEntries = posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    return [...routes, ...postEntries];
  } catch {
    return routes;
  }
}

