const PROXY_HOST = "duxbe.jiobase.com";

function shouldRewriteHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "api.duxbe.com" ||
    host === "api.duxbe.app" ||
    host.endsWith(".supabase.co")
  );
}

export function normalizeImageUrl(src?: string | null): string {
  if (!src) return "";
  if (!/^https?:\/\//i.test(src)) return src;

  try {
    const url = new URL(src);
    if (!shouldRewriteHost(url.hostname)) return src;

    url.protocol = "https:";
    url.hostname = PROXY_HOST;
    url.port = "";
    return url.toString();
  } catch {
    return src.replace(
      /^https?:\/\/(?:[a-z0-9-]+\.supabase\.co|api\.duxbe\.com|api\.duxbe\.app)(?=\/|$)/i,
      `https://${PROXY_HOST}`
    );
  }
}
