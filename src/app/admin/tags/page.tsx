"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at?: string | null;
  postCount: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export default function AdminTagsPage() {
  const supabase = createClient();

  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogTag | null>(null);

  const fetchTags = async () => {
    setLoading(true);

    const [tagsRes, relationsRes] = await Promise.all([
      supabase.from("blog_tags").select("*").order("name"),
      supabase.from("blog_post_tags").select("tag_id"),
    ]);

    if (tagsRes.error) {
      toast.error("Failed to fetch tags");
      console.error(tagsRes.error);
      setLoading(false);
      return;
    }

    const counts = new Map<string, number>();
    (relationsRes.data || []).forEach((relation: any) => {
      counts.set(relation.tag_id, (counts.get(relation.tag_id) || 0) + 1);
    });

    setTags(
      (tagsRes.data || []).map((tag: any) => ({
        ...tag,
        postCount: counts.get(tag.id) || 0,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tags;

    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.slug.toLowerCase().includes(query),
    );
  }, [search, tags]);

  const isDuplicate = (name: string, ignoreId?: string) => {
    const slug = slugify(name);
    return tags.some(
      (tag) =>
        tag.id !== ignoreId &&
        (tag.slug === slug || tag.name.toLowerCase() === name.toLowerCase()),
    );
  };

  const handleCreate = async () => {
    const name = newName.trim();
    const slug = slugify(name);

    if (!name || !slug) {
      toast.error("Tag name is required");
      return;
    }

    if (isDuplicate(name)) {
      toast.error("Tag already exists");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("blog_tags")
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create tag");
      console.error(error);
    } else {
      toast.success("Tag created");
      setTags((prev) =>
        [...prev, { ...data, postCount: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewName("");
    }

    setSaving(false);
  };

  const startEdit = (tag: BlogTag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (tag: BlogTag) => {
    const name = editName.trim();
    const slug = slugify(name);

    if (!name || !slug) {
      toast.error("Tag name is required");
      return;
    }

    if (isDuplicate(name, tag.id)) {
      toast.error("Tag already exists");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("blog_tags")
      .update({ name, slug })
      .eq("id", tag.id);

    if (error) {
      toast.error("Failed to update tag");
      console.error(error);
    } else {
      toast.success("Tag updated");
      setTags((prev) =>
        prev
          .map((item) =>
            item.id === tag.id ? { ...item, name, slug } : item,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      cancelEdit();
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);

    await supabase
      .from("blog_post_tags")
      .delete()
      .eq("tag_id", deleteTarget.id);

    const { error } = await supabase
      .from("blog_tags")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error("Failed to delete tag");
      console.error(error);
    } else {
      toast.success("Tag deleted");
      setTags((prev) => prev.filter((tag) => tag.id !== deleteTarget.id));
      setDeleteTarget(null);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage blog tags used for filtering and post organization
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Tags className="h-4 w-4" />
          {tags.length} tags
        </div>
      </div>

      <Card className="border p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="New tag name..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={handleCreate} disabled={saving || !newName.trim()}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Tag
          </Button>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "No tags match your search." : "No tags yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTags.map((tag) => {
            const isEditing = editingId === tag.id;

            return (
              <Card key={tag.id} className="border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdate(tag);
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        autoFocus
                      />
                    ) : (
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {tag.name}
                        </h3>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {tag.slug}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 inline-flex rounded-md border bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                      {tag.postCount} {tag.postCount === 1 ? "post" : "posts"}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdate(tag)}
                          disabled={saving}
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(tag)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(tag)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              ? This will also remove the tag from{" "}
              {deleteTarget?.postCount || 0} related posts.
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
