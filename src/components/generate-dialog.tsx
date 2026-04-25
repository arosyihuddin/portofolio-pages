"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
  suggestedTags: string[];
}

interface GenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: GeneratedContent) => void;
}

export default function GenerateDialog({
  open,
  onOpenChange,
  onGenerated,
}: GenerateDialogProps) {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or instructions");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), language, length }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate content");
        return;
      }

      onGenerated(data);
      toast.success("Content generated successfully!");
      onOpenChange(false);
      setTopic("");
    } catch {
      toast.error("An error occurred while generating content");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate with AI
          </AlertDialogTitle>
          <AlertDialogDescription>
            Describe the topic or provide instructions. AI will generate the
            full article including title, summary, and content.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Topic / Instructions
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Tulis artikel tentang cara membangun RAG chatbot menggunakan LangChain dan FastAPI..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              disabled={generating}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "id" | "en")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={generating}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Length */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Length</label>
              <select
                value={length}
                onChange={(e) =>
                  setLength(e.target.value as "short" | "medium" | "long")
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={generating}
              >
                <option value="short">Short (~500 words)</option>
                <option value="medium">Medium (~1000 words)</option>
                <option value="long">Long (~2000 words)</option>
              </select>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={generating}>Cancel</AlertDialogCancel>
          <Button onClick={handleGenerate} disabled={generating || !topic.trim()}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
