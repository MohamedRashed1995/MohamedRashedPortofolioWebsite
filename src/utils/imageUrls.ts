export interface ImageSources {
  original: string;
  webp?: string;
  avif?: string;
}

function replaceImageExtension(url: string, extension: '.webp' | '.avif'): string | undefined {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return undefined;
  }

  const match = url.match(/^([^?#]+)(\?[^#]*)?(#.*)?$/);
  if (!match || !/\.(png|jpe?g)$/i.test(match[1])) {
    return undefined;
  }

  return `${match[1].replace(/\.(png|jpe?g)$/i, extension)}${match[2] || ''}${match[3] || ''}`;
}

export function withCacheVersion(url: string, version?: string | number): string {
  if (!url || !version || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url, window.location.origin);
    parsedUrl.searchParams.set('v', String(version));
    return parsedUrl.origin === window.location.origin
      ? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
      : parsedUrl.toString();
  } catch {
    return url;
  }
}

export function createImageSources(
  src: string,
  version?: string | number,
  sources?: Omit<ImageSources, 'original'>
): ImageSources {
  return {
    original: withCacheVersion(src, version),
    webp: withCacheVersion(sources?.webp || replaceImageExtension(src, '.webp') || '', version) || undefined,
    avif: withCacheVersion(sources?.avif || replaceImageExtension(src, '.avif') || '', version) || undefined,
  };
}
