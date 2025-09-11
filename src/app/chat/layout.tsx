import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant",
  description: "Chat with Jarvis, your assistant.",
  alternates: {
    canonical: "/chat",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

