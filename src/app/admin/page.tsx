"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, Eye, FilePenLine, Tags } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTags: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const [postsRes, publishedRes, tagsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("published", true),
        supabase
          .from("blog_tags")
          .select("id", { count: "exact", head: true }),
      ]);

      const total = postsRes.count ?? 0;
      const published = publishedRes.count ?? 0;

      setStats({
        totalPosts: total,
        publishedPosts: published,
        draftPosts: total - published,
        totalTags: tagsRes.count ?? 0,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      href: "/admin/blog",
    },
    {
      label: "Published",
      value: stats.publishedPosts,
      icon: Eye,
      href: "/admin/blog",
    },
    {
      label: "Drafts",
      value: stats.draftPosts,
      icon: FilePenLine,
      href: "/admin/blog",
    },
    {
      label: "Tags",
      value: stats.totalTags,
      icon: Tags,
      href: "/admin/blog",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your blog content
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
