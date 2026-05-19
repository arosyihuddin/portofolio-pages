"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  extractStorageKeysFromHtml,
  urlToStorageKey,
} from "@/lib/blog-images";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  blog_post_tags: { blog_tags: { name: string; slug: string } }[];
}

export default function AdminBlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    slug: string;
    title: string;
  } | null>(null);
  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, summary, published, published_at, created_at, updated_at, blog_post_tags(blog_tags(name, slug))",
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch posts");
      console.error(error);
    } else {
      setPosts((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { id, slug } = deleteTarget;
    setDeleting(id);
    setDeleteTarget(null);

    // Collect images so we can clean up storage after the post is deleted.
    const { data: postData } = await supabase
      .from("blog_posts")
      .select("content, cover_image")
      .eq("id", id)
      .single();

    // Delete post-tag relations first
    await supabase.from("blog_post_tags").delete().eq("post_id", id);
    await supabase.from("page_views").delete().eq("path", `/blog/${slug}`);
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted");
      setPosts((prev) => prev.filter((p) => p.id !== id));

      // Best-effort cleanup of orphaned images.
      const keys = new Set<string>();
      if (postData) {
        extractStorageKeysFromHtml(postData.content).forEach((k) =>
          keys.add(k),
        );
        const coverKey = urlToStorageKey(postData.cover_image);
        if (coverKey) keys.add(coverKey);
      }
      if (keys.size > 0) {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: Array.from(keys) }),
          });
        } catch (err) {
          console.error("Failed to clean up post images:", err);
        }
      }
    }
    setDeleting(null);
  };

  const togglePublish = async (id: string, currentlyPublished: boolean) => {
    const updates: any = { published: !currentlyPublished };
    if (!currentlyPublished) {
      updates.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update post");
    } else {
      toast.success(currentlyPublished ? "Post unpublished" : "Post published");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                published: !currentlyPublished,
                published_at: !currentlyPublished
                  ? new Date().toISOString()
                  : p.published_at,
              }
            : p,
        ),
      );
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your blog articles
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? "No posts match your search." : "No posts yet."}
          </p>
          {!search && (
            <Link href="/admin/blog/new">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="border shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Post info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  {post.summary && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {post.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    {post.blog_post_tags?.length > 0 && (
                      <div className="flex gap-1">
                        {post.blog_post_tags.map((pt: any, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                          >
                            {pt.blog_tags?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View post">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    title={post.published ? "Unpublish" : "Publish"}
                    onClick={() => togglePublish(post.id, post.published)}
                  >
                    {post.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      setDeleteTarget({
                        id: post.id,
                        slug: post.slug,
                        title: post.title,
                      })
                    }
                    disabled={deleting === post.id}
                  >
                    {deleting === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
