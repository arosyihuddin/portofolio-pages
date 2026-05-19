import {
  getPost,
  getAdjacentPosts,
  getReadingTime,
  extractHeadings,
  addHeadingIds,
  getPostViewCount,
} from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, Eye } from "lucide-react";
import TocSidebar from "@/components/toc-sidebar";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = await getPost(params.slug);
  if (!post) return undefined;

  const ogImage = post.cover_image
    ? post.cover_image
    : `${DATA.url}/og?title=${encodeURIComponent(post.title)}`;

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.published_at,
      url: `${DATA.url}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const readingTime = getReadingTime(post.content);
  const headings = extractHeadings(post.content);
  const contentWithIds = addHeadingIds(post.content);
  const [adjacent, viewCount] = await Promise.all([
    getAdjacentPosts(post.published_at),
    getPostViewCount(post.slug),
  ]);

  return (
    <main className="flex flex-col min-h-[100dvh] pb-28">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            description: post.summary,
            image: post.cover_image || undefined,
            url: `${DATA.url}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: DATA.name,
            },
          }),
        }}
      />

      <article className="w-full py-8 pt-2">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to blog
        </Link>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-lg overflow-hidden mb-6 -mx-2 sm:mx-0">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="space-y-3 mb-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/blog?tag=${tag.slug}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {viewCount.toLocaleString()} views
            </span>
          </div>
        </header>

        {/* Table of Contents — mobile: inline / desktop: fixed sidebar */}
        {headings.length > 2 && (
          <>
            <TocSidebar headings={headings} variant="inline" />
            <TocSidebar headings={headings} variant="sidebar" />
          </>
        )}

        {/* Main content */}
        <div
          className="prose dark:prose-invert prose-headings:scroll-mt-20 max-w-none"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* Prev / Next navigation */}
        {(adjacent.prev || adjacent.next) && (
          <nav className="mt-12 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adjacent.prev ? (
              <Link
                href={`/blog/${adjacent.prev.slug}`}
                className="group flex flex-col p-4 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <ArrowLeft className="h-3 w-3" />
                  Previous
                </span>
                <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {adjacent.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {adjacent.next ? (
              <Link
                href={`/blog/${adjacent.next.slug}`}
                className="group flex flex-col items-end p-4 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  Next
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {adjacent.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}
      </article>
    </main>
  );
}
