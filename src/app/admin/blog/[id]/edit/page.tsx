"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import GenerateDialog, {
  type GeneratedContent,
} from "@/components/generate-dialog";
import {
  extractStorageKeysFromHtml,
  urlToStorageKey,
  diffRemovedKeys,
} from "@/lib/blog-images";

const NovelEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] w-full border rounded-md bg-background flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  // We store the initial HTML to pass to the editor
  const [initialHtml, setInitialHtml] = useState<string | null>(null);

  // Snapshot of image keys + cover key when the post was first loaded so we
  // can diff and clean up storage on save.
  const [originalContentKeys, setOriginalContentKeys] = useState<string[]>([]);
  const [originalCoverKey, setOriginalCoverKey] = useState<string | null>(null);

  // Tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      const [postRes, tagsRes, postTagsRes] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("id", postId).single(),
        supabase.from("blog_tags").select("*").order("name"),
        supabase.from("blog_post_tags").select("tag_id").eq("post_id", postId),
      ]);

      if (postRes.error || !postRes.data) {
        toast.error("Post not found");
        router.push("/admin/blog");
        return;
      }

      const post = postRes.data;
      setTitle(post.title);
      setSlug(post.slug);
      setSummary(post.summary || "");
      setCoverImage(post.cover_image || "");
      setHtmlContent(post.content || "");
      setInitialHtml(post.content || "");
      setPublished(post.published);
      setOriginalContentKeys(extractStorageKeysFromHtml(post.content));
      setOriginalCoverKey(urlToStorageKey(post.cover_image));

      if (tagsRes.data) setAllTags(tagsRes.data);
      if (postTagsRes.data) {
        setSelectedTags(postTagsRes.data.map((pt: any) => pt.tag_id));
      }

      setLoadingPost(false);
    };

    fetchPost();
  }, [postId]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
        toast.success("Cover image uploaded");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    }
    setUploadingCover(false);
  };

  const addTag = async () => {
    if (!newTagName.trim()) return;

    const tagSlug = slugify(newTagName);
    const existing = allTags.find(
      (t) =>
        t.slug === tagSlug ||
        t.name.toLowerCase() === newTagName.toLowerCase(),
    );

    if (existing) {
      if (!selectedTags.includes(existing.id)) {
        setSelectedTags((prev) => [...prev, existing.id]);
      }
      setNewTagName("");
      return;
    }

    const { data, error } = await supabase
      .from("blog_tags")
      .insert({ name: newTagName.trim(), slug: tagSlug })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create tag");
      return;
    }

    setAllTags((prev) => [...prev, data]);
    setSelectedTags((prev) => [...prev, data.id]);
    setNewTagName("");
  };

  const savePost = async (togglePublish?: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    try {
      const newPublished =
        togglePublish !== undefined ? togglePublish : published;

      const postData: any = {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content: htmlContent,
        cover_image: coverImage || null,
        published: newPublished,
      };

      // Set published_at when first publishing
      if (newPublished && !published) {
        postData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", postId);

      if (error) {
        if (error.code === "23505") {
          toast.error("A post with this slug already exists");
        } else {
          toast.error("Failed to save post");
          console.error(error);
        }
        return;
      }

      // Update tags: delete old, insert new
      await supabase.from("blog_post_tags").delete().eq("post_id", postId);
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map((tagId) => ({
          post_id: postId,
          tag_id: tagId,
        }));
        await supabase.from("blog_post_tags").insert(tagRelations);
      }

      // Clean up images that were removed from the editor or cover slot.
      const newContentKeys = extractStorageKeysFromHtml(htmlContent);
      const newCoverKey = urlToStorageKey(coverImage);
      const removed = diffRemovedKeys(originalContentKeys, newContentKeys);
      if (originalCoverKey && originalCoverKey !== newCoverKey) {
        // Only delete the old cover if it isn't still referenced inside the
        // article body.
        if (!newContentKeys.includes(originalCoverKey)) {
          removed.push(originalCoverKey);
        }
      }
      if (removed.length > 0) {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: removed }),
          });
        } catch (err) {
          console.error("Failed to clean up unused images:", err);
        }
      }
      setOriginalContentKeys(newContentKeys);
      setOriginalCoverKey(newCoverKey);

      setPublished(newPublished);
      toast.success("Post saved!");
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerated = (result: GeneratedContent) => {
    setTitle(result.title);
    setSlug(slugify(result.title));
    setSummary(result.summary);
    setHtmlContent(result.content);
    setInitialHtml(result.content);
    setEditorKey((prev) => prev + 1);

    if (result.suggestedTags.length > 0 && allTags.length > 0) {
      const matchedTagIds = allTags
        .filter((t) =>
          result.suggestedTags.some(
            (st) => st.toLowerCase() === t.name.toLowerCase() || st.toLowerCase() === t.slug,
          ),
        )
        .map((t) => t.id);
      if (matchedTagIds.length > 0) {
        setSelectedTags((prev) => Array.from(new Set([...prev, ...matchedTagIds])));
      }
    }
  };

  if (loadingPost) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                published
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setGenerateOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button
            variant="outline"
            onClick={() => savePost(published ? false : undefined)}
            disabled={saving}
          >
            {published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={() => savePost(published ? undefined : true)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : published ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {published ? "Save" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 focus:ring-0"
          />

          {initialHtml !== null && (
            <NovelEditor
              key={editorKey}
              onChange={() => {}}
              onHtmlChange={setHtmlContent}
              initialHtml={initialHtml || ""}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Slug */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-sm font-medium">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-sm font-medium">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description for SEO and listing..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-sm font-medium">Cover Image</label>
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setCoverImage("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                  {uploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Click to upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-sm font-medium">Tags</label>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tagId) => {
                    const tag = allTags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.filter((id) => id !== tagId),
                            )
                          }
                          className="hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {allTags
                  .filter((t) => !selectedTags.includes(t.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) => [...prev, tag.id])
                      }
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground hover:bg-accent transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag..."
                  className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={addTag}
                  disabled={!newTagName.trim()}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate with AI Dialog */}
      <GenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerated={handleGenerated}
      />
    </div>
  );
}
