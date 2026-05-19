import { createClient } from "@/lib/supabase/server";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  cover_image: string | null;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: { name: string; slug: string }[];
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export async function getPostViewCount(slug: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .eq("path", `/blog/${slug}`);

  if (error) {
    console.error("Error fetching post view count:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Calculate reading time from HTML content
 */
export function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Extract headings from HTML content for Table of Contents
 */
export function extractHeadings(
  html: string,
): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Add IDs to headings in HTML for anchor links
 */
export function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-3])([^>]*)>(.*?)<\/h[1-3]>/gi,
    (_match, level, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
    },
  );
}

/**
 * Fetch all published blog posts
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, content, summary, cover_image, published, published_at, created_at, updated_at, blog_post_tags(blog_tags(name, slug))",
    )
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return (data || []).map((post: any) => ({
    ...post,
    tags: (post.blog_post_tags || []).map((pt: any) => pt.blog_tags).filter(Boolean),
  }));
}

/**
 * Fetch a single blog post by slug
 */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, content, summary, cover_image, published, published_at, created_at, updated_at, blog_post_tags(blog_tags(name, slug))",
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    tags: ((data as any).blog_post_tags || [])
      .map((pt: any) => pt.blog_tags)
      .filter(Boolean),
  } as BlogPost;
}

/**
 * Fetch adjacent posts for prev/next navigation
 */
export async function getAdjacentPosts(publishedAt: string): Promise<{
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}> {
  const supabase = createClient();

  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("title, slug")
      .eq("published", true)
      .lt("published_at", publishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("blog_posts")
      .select("title, slug")
      .eq("published", true)
      .gt("published_at", publishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    prev: prevRes.data || null,
    next: nextRes.data || null,
  };
}

/**
 * Fetch all tags
 */
export async function getAllTags(): Promise<BlogTag[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data || [];
}
