import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";

export default async function sitemap() {
  const base = DATA.url.replace(/\/$/, "");

  const routes = ["", "/projects", "/blog", "/chat"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const posts = await getBlogPosts();
    const postEntries = posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.metadata.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    return [...routes, ...postEntries];
  } catch {
    return routes;
  }
}

