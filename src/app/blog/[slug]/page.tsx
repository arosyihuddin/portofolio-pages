import {
  getPost,
  getAdjacentPosts,
  getReadingTime,
  extractHeadings,
  addHeadingIds,
} from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, List } from "lucide-react";

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
  const adjacent = await getAdjacentPosts(post.published_at);

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
          </div>
        </header>

        {/* Table of Contents — mobile/tablet: inline above content */}
        {headings.length > 2 && (
          <nav className="mb-8 rounded-lg border bg-muted/30 p-4 xl:hidden">
            <div className="flex items-center gap-2 mb-3">
              <List className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">On this page</p>
            </div>
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className={`block text-sm text-muted-foreground hover:text-foreground transition-colors leading-relaxed ${
                      heading.level === 2
                        ? "pl-0"
                        : heading.level === 3
                          ? "pl-4"
                          : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Table of Contents — desktop: fixed sidebar right of container */}
        {headings.length > 2 && (
          <nav
            className="hidden xl:block fixed top-24 w-48 z-20"
            style={{ left: "calc(50% + 384px + 2rem)" }}
          >
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              On this page
            </p>
            <ul className="space-y-1.5 border-l border-border pl-3">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className={`block text-xs text-muted-foreground hover:text-foreground transition-colors leading-relaxed ${
                      heading.level === 3 ? "pl-3" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
