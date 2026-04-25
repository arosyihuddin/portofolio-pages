"use client";

import { useEffect, useState } from "react";
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
  Plus,
  Save,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface ContextSection {
  id: string;
  section: string;
  sort_order: number;
  content: string;
  enabled: boolean;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function AdminContextPage() {
  const [sections, setSections] = useState<ContextSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, { section: string; content: string; sort_order: number; type: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContextSection | null>(null);
  const [adding, setAdding] = useState(false);
  const [newSection, setNewSection] = useState({ section: "", content: "", sort_order: 0 });
  const supabase = createClient();

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_context")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch context sections");
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const s = sections.find((s) => s.id === id);
      if (s && !editData[id]) {
        setEditData((prev) => ({
          ...prev,
          [id]: { section: s.section, content: s.content, sort_order: s.sort_order, type: s.type },
        }));
      }
    }
  };

  const handleSave = async (id: string) => {
    const data = editData[id];
    if (!data) return;

    setSaving(id);
    const { error } = await supabase
      .from("ai_context")
      .update({
        section: data.section,
        content: data.content,
        sort_order: data.sort_order,
        type: data.type,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to save section");
    } else {
      toast.success("Section saved");
      setSections((prev) =>
        prev
          .map((s) =>
            s.id === id
              ? { ...s, section: data.section, content: data.content, sort_order: data.sort_order, type: data.type }
              : s,
          )
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    }
    setSaving(null);
  };

  const toggleEnabled = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from("ai_context")
      .update({ enabled: !currentEnabled })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update section");
    } else {
      toast.success(currentEnabled ? "Section disabled" : "Section enabled");
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s)),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from("ai_context")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error("Failed to delete section");
    } else {
      toast.success("Section deleted");
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleAdd = async () => {
    if (!newSection.section.trim()) {
      toast.error("Section name is required");
      return;
    }

    setSaving("new");
    const maxOrder = sections.length > 0
      ? Math.max(...sections.map((s) => s.sort_order))
      : -1;

    const { data, error } = await supabase
      .from("ai_context")
      .insert({
        section: newSection.section.trim(),
        content: newSection.content,
        sort_order: newSection.sort_order || maxOrder + 1,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add section");
    } else {
      toast.success("Section added");
      setSections((prev) => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      setNewSection({ section: "", content: "", sort_order: 0 });
      setAdding(false);
    }
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Context</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage context data used by the AI assistant
          </p>
        </div>
        <Button onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add new section form */}
          {adding && (
            <Card className="border shadow-sm border-primary/30">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">New Section</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setNewSection({ section: "", content: "", sort_order: 0 });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Section Name
                    </label>
                    <input
                      type="text"
                      value={newSection.section}
                      onChange={(e) =>
                        setNewSection((prev) => ({ ...prev, section: e.target.value }))
                      }
                      placeholder="e.g. Pengalaman Kerja"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Order
                    </label>
                    <input
                      type="number"
                      value={newSection.sort_order}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Content (Markdown)
                  </label>
                  <textarea
                    value={newSection.content}
                    onChange={(e) =>
                      setNewSection((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Write context content in markdown..."
                    rows={8}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAdd} disabled={saving === "new"}>
                    {saving === "new" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Section
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Sections list */}
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No context sections yet.</p>
            </div>
          ) : (
            sections.map((section) => {
              const isExpanded = expandedId === section.id;
              const edit = editData[section.id];

              return (
                <Card
                  key={section.id}
                  className={`border shadow-sm transition-colors ${
                    !section.enabled ? "opacity-50" : ""
                  }`}
                >
                  {/* Section header (always visible) */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => toggleExpand(section.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">
                      {section.sort_order}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{section.section}</h3>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            section.type === "system_prompt"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {section.type === "system_prompt" ? "System Prompt" : "Context"}
                        </span>
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {section.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={section.enabled ? "Disable" : "Enable"}
                        onClick={() => toggleEnabled(section.id, section.enabled)}
                      >
                        {section.enabled ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget(section)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isExpanded && edit && (
                    <div className="border-t px-4 pb-4 pt-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px] gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Section Name
                          </label>
                          <input
                            type="text"
                            value={edit.section}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [section.id]: { ...prev[section.id], section: e.target.value },
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Type
                          </label>
                          <select
                            value={edit.type}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [section.id]: { ...prev[section.id], type: e.target.value },
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="context">Context</option>
                            <option value="system_prompt">System Prompt</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Order
                          </label>
                          <input
                            type="number"
                            value={edit.sort_order}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [section.id]: {
                                  ...prev[section.id],
                                  sort_order: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Content (Markdown)
                        </label>
                        <textarea
                          value={edit.content}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [section.id]: { ...prev[section.id], content: e.target.value },
                            }))
                          }
                          rows={12}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSave(section.id)}
                          disabled={saving === section.id}
                          size="sm"
                        >
                          {saving === section.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
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
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the section{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.section}&rdquo;
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
