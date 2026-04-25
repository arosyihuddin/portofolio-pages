"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  FilePenLine,
  Tags,
  TrendingUp,
  BarChart3,
  Plus,
  Pencil,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
}

interface TrafficStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

interface TopPost {
  path: string;
  count: number;
  title?: string;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTags: 0,
  });
  const [traffic, setTraffic] = useState<TrafficStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAll = async () => {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
      const weekAgo = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const monthAgo = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [
        postsRes,
        publishedRes,
        tagsRes,
        recentRes,
        viewsTodayRes,
        viewsWeekRes,
        viewsMonthRes,
        viewsTotalRes,
      ] = await Promise.all([
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
        supabase
          .from("blog_posts")
          .select("id, title, slug, published, published_at, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthAgo),
        supabase
          .from("page_views")
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

      setTraffic({
        today: viewsTodayRes.count ?? 0,
        week: viewsWeekRes.count ?? 0,
        month: viewsMonthRes.count ?? 0,
        total: viewsTotalRes.count ?? 0,
      });

      if (recentRes.data) {
        setRecentPosts(recentRes.data);
      }

      // Fetch top posts by views
      const { data: viewsData } = await supabase
        .from("page_views")
        .select("path")
        .like("path", "/blog/%");

      if (viewsData) {
        const counts: Record<string, number> = {};
        viewsData.forEach((v: any) => {
          counts[v.path] = (counts[v.path] || 0) + 1;
        });

        const sorted: TopPost[] = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([path, count]) => ({ path, count }));

        if (sorted.length > 0) {
          const slugs = sorted.map((s) => s.path.replace("/blog/", ""));
          const { data: postsData } = await supabase
            .from("blog_posts")
            .select("slug, title")
            .in("slug", slugs);

          const titleMap: Record<string, string> = {};
          postsData?.forEach((p: any) => {
            titleMap[p.slug] = p.title;
          });

          sorted.forEach((s) => {
            const slug = s.path.replace("/blog/", "");
            s.title = titleMap[slug] || slug;
          });
        }

        setTopPosts(sorted);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  const statCards = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Published",
      value: stats.publishedPosts,
      icon: Eye,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Drafts",
      value: stats.draftPosts,
      icon: FilePenLine,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Tags",
      value: stats.totalTags,
      icon: Tags,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const trafficCards = [
    { label: "Today", value: traffic.today },
    { label: "7 Days", value: traffic.week },
    { label: "30 Days", value: traffic.month },
    { label: "All Time", value: traffic.total },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your blog content and traffic
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic Stats */}
      <Card className="border shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Page Views</h2>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trafficCards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border bg-muted/30 p-4 text-center"
              >
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card className="border shadow-sm">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Posts</h2>
              <Link
                href="/admin/blog"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No posts yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.published_at || post.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          post.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {post.published ? "Live" : "Draft"}
                      </span>
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Posts by Views */}
        <Card className="border shadow-sm">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Top Posts</h2>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No traffic data yet
              </p>
            ) : (
              <div className="space-y-3">
                {topPosts.map((post, i) => (
                  <div
                    key={post.path}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                        #{i + 1}
                      </span>
                      <p className="text-sm truncate">
                        {post.title || post.path}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{post.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
