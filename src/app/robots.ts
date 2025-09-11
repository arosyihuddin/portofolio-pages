import { DATA } from "@/data/resume";

export default function robots() {
  const base = DATA.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

