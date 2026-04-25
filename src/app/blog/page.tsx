import { getBlogPosts, getAllTags, getReadingTime } from "@/data/blog";
import type { Metadata } from "next";
import BlurFade from "@/components/magicui/blur-fade";
import BlogListClient from "./blog-list-client";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on software development, AI, and more.",
  alternates: {
    canonical: "/blog",
  },
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getBlogPosts(), getAllTags()]);

  const postsWithReadingTime = posts.map((post) => ({
    ...post,
    readingTime: getReadingTime(post.content),
  }));

  return (
    <main className="flex flex-col min-h-[100dvh] pb-28">
      <section className="w-full py-8 pt-2 space-y-8">
        <BlurFade delay={0.04}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Blog
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Articles & Thoughts
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-lg mx-auto">
                Writing about software engineering, machine learning, and things
                I learn along the way.
              </p>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.08}>
          <BlogListClient
            posts={postsWithReadingTime}
            tags={tags}
          />
        </BlurFade>
      </section>
    </main>
  );
}
