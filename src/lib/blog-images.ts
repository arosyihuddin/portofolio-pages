/**
 * Helpers for tracking blog post images uploaded to Supabase storage.
 *
 * Convention: uploaded files live in the `blog-images` bucket under the
 * `uploads/` prefix. We only delete files that match this prefix to avoid
 * touching anything else.
 */

const STORAGE_PREFIX = "uploads/";

/**
 * Extract storage paths (e.g. "uploads/12345-abc.png") from an HTML blob.
 * Looks at <img src="..."> attributes and any string that contains the
 * Supabase storage public URL pattern.
 */
export function extractStorageKeysFromHtml(html: string | null | undefined): string[] {
  if (!html) return [];
  const keys = new Set<string>();
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const key = urlToStorageKey(match[1]);
    if (key) keys.add(key);
  }
  return Array.from(keys);
}

/**
 * Convert a Supabase public URL into a storage path within the
 * `blog-images` bucket. Returns null if it does not look like one of our
 * uploaded files.
 */
export function urlToStorageKey(url: string | null | undefined): string | null {
  if (!url) return null;
  // Match `.../object/public/blog-images/uploads/<filename>` or
  // `.../object/sign/blog-images/uploads/<filename>?...`.
  const m = url.match(/\/blog-images\/(uploads\/[^?#"']+)/);
  if (!m) return null;
  const key = decodeURIComponent(m[1]);
  return key.startsWith(STORAGE_PREFIX) ? key : null;
}

/**
 * Diff two sets of storage keys and return the ones that exist in `before`
 * but not in `after` — i.e. images that were removed.
 */
export function diffRemovedKeys(before: string[], after: string[]): string[] {
  const afterSet = new Set(after);
  return before.filter((k) => !afterSet.has(k));
}
