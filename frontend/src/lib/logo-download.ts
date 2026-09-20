import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const FILES: Record<string, { disk: string; download: string }> = {
  logo: { disk: 'logo.png', download: 'BuddySearch-logo.png' },
  'logo-white': { disk: 'buddy_search_white_grey.png', download: 'BuddySearch-logo-white.png' },
  'logo-red': { disk: 'buddy_search_red_white.png', download: 'BuddySearch-logo-red-white.png' },
  favicon: { disk: 'favicon.png', download: 'BuddySearch-favicon.png' },
  sheet: { disk: 'BuddySearch Logo Files.png', download: 'BuddySearch-logo-sheet.png' },
};

export async function logoDownloadResponse(key: string) {
  const spec = FILES[key];
  if (!spec) return null;
  const buf = await readFile(join(process.cwd(), 'public', spec.disk));
  return new Response(buf, {
    headers: {
      'content-type': 'image/png',
      'content-disposition': `attachment; filename="${spec.download}"`,
      'cache-control': 'public, max-age=86400',
    },
  });
}
