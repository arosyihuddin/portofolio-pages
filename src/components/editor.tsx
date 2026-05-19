"use client";

import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  EditorBubble,
  EditorBubbleItem,
  ImageResizer,
  handleCommandNavigation,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  Command,
  renderItems,
  useEditor,
  type JSONContent,
} from "novel";
import { useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Code,
  ImageIcon,
  CheckSquare,
  Bold,
  Italic,
  Strikethrough,
  CodeIcon,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// Image upload
// ============================================
async function uploadImageFile(file: File): Promise<string | null> {
  if (!file.type.includes("image/")) {
    toast.error("File type not supported.");
    return null;
  }
  if (file.size / 1024 / 1024 > 5) {
    toast.error("File size too big (max 5MB).");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url || null;
  } catch (err) {
    console.error(err);
    toast.error("Upload failed");
    return null;
  }
}

async function insertImageAtCursor(editor: any, file: File) {
  const url = await uploadImageFile(file);
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
}

async function insertImageAtViewPos(view: any, pos: number, file: File) {
  const url = await uploadImageFile(file);
  if (!url) return;
  const { schema } = view.state;
  const node = schema.nodes.image?.create({ src: url });
  if (!node) return;
  const tr = view.state.tr.insert(pos, node);
  view.dispatch(tr);
}

// ============================================
// Extensions config (from Novel docs)
// ============================================
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class:
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
  },
});

const tiptapImage = TiptapImage.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "rounded-lg border border-muted",
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: "not-prose pl-2",
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: "flex items-start my-4",
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: "mt-4 mb-6 border-t border-muted-foreground",
  },
});

const placeholder = Placeholder.configure({
  placeholder: "Type '/' for commands...",
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: "list-disc list-outside leading-3 -mt-2",
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: "list-decimal list-outside leading-3 -mt-2",
    },
  },
  listItem: {
    HTMLAttributes: {
      class: "leading-normal -mb-2",
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: "border-l-4 border-primary",
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: "rounded-sm bg-muted border p-5 font-mono font-medium",
    },
  },
  code: {
    HTMLAttributes: {
      class: "rounded-md bg-muted px-1.5 py-1 font-mono font-medium",
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

// ============================================
// Slash command suggestion items
// ============================================
const suggestionItems = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }: any) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }: any) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          await insertImageAtCursor(editor, input.files[0]);
        }
      };
      input.click();
    },
  },
];

// Slash command extension
const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

// All extensions combined
const extensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  TiptapUnderline,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule,
  slashCommand,
];

// ============================================
// Fixed toolbar
// ============================================
function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-accent text-foreground" : ""
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

function EditorToolbar() {
  const { editor } = useEditor();
  if (!editor) return null;

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const pickImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        await insertImageAtCursor(editor, input.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-background/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <CodeIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="To-do list"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Quote"
      >
        <TextQuote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={promptLink}
        active={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={pickImage} title="Image">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

// ============================================
// Editor component
// ============================================
interface EditorProps {
  initialContent?: JSONContent;
  initialHtml?: string;
  onChange: (content: JSONContent) => void;
  onHtmlChange?: (html: string) => void;
}

export default function NovelEditor({
  initialContent,
  initialHtml,
  onChange,
  onHtmlChange,
}: EditorProps) {
  return (
    <EditorRoot>
      <EditorContent
        initialContent={initialContent}
        extensions={extensions}
        className="relative w-full overflow-hidden rounded-md border bg-background"
        editorProps={{
          handleDOMEvents: {
            keydown: (_view: any, event: any) => {
              const slashMenu = document.querySelector("#slash-command");
              if (slashMenu) {
                return handleCommandNavigation(event);
              }
              return false;
            },
          },
          handlePaste: (view: any, event: any) => {
            const files = event.clipboardData?.files;
            if (files && files.length) {
              const file = Array.from(files).find((f: any) =>
                f.type?.includes("image/"),
              ) as File | undefined;
              if (file) {
                event.preventDefault();
                const pos = view.state.selection.from;
                insertImageAtViewPos(view, pos, file);
                return true;
              }
            }
            return false;
          },
          handleDrop: (view: any, event: any, _slice: any, moved: any) => {
            if (moved) return false;
            const files = event.dataTransfer?.files;
            if (files && files.length) {
              const file = Array.from(files).find((f: any) =>
                f.type?.includes("image/"),
              ) as File | undefined;
              if (file) {
                event.preventDefault();
                const coords = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                const pos = coords?.pos ?? view.state.selection.from;
                insertImageAtViewPos(view, pos, file);
                return true;
              }
            }
            return false;
          },
          attributes: {
            class:
              "prose prose-sm dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[500px] p-4",
          },
        }}
        onCreate={({ editor }) => {
          if (initialHtml) {
            editor.commands.setContent(initialHtml);
          }
        }}
        onUpdate={({ editor }) => {
          onChange(editor.getJSON());
          if (onHtmlChange) {
            onHtmlChange(editor.getHTML());
          }
        }}
        slotBefore={<EditorToolbar />}
        slotAfter={<ImageResizer />}
      >
        {/* Slash command menu */}
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground text-sm">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val: any) => item.command(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent cursor-pointer"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        {/* Bubble menu for text formatting */}
        <EditorBubble
          tippyOptions={{ placement: "top" }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
        >
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleBold().run()}
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Bold className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Italic className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) =>
              editor.chain().focus().toggleUnderline().run()
            }
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleCode().run()}
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <CodeIcon className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
