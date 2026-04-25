"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import ChatBubble from "@/components/chat-bubble";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isBlogDetail = pathname.startsWith("/blog/") && pathname !== "/blog";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      className={`mx-auto py-12 sm:py-24 px-6 ${
        isBlogDetail ? "max-w-3xl" : "max-w-2xl"
      }`}
    >
      {children}
      <Navbar />
      <ChatBubble />
    </div>
  );
}
