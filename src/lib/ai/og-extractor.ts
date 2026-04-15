interface OgTags {
  title: string | null
  description: string | null
  image: string | null
}

export async function fetchOgTags(url: string): Promise<OgTags | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeoutId)

    if (!res.ok) return null

    const html = await res.text()

    function extractMeta(property: string): string | null {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
      return match?.[1] ?? null
    }

    function extractMetaName(name: string): string | null {
      const match =
        html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'))
      return match?.[1] ?? null
    }

    const title =
      extractMeta('og:title') ??
      extractMetaName('twitter:title') ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null

    const description =
      extractMeta('og:description') ??
      extractMetaName('description') ??
      extractMetaName('twitter:description') ??
      null

    const image =
      extractMeta('og:image') ??
      extractMetaName('twitter:image') ??
      null

    return { title, description, image }
  } catch {
    return null
  }
}
