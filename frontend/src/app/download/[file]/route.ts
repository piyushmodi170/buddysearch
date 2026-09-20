import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

const FILES: Record<string, { disk: string; download: string; type: string }> = {
  'logo-1x1': {
    disk: 'logo-1x1.png',
    download: 'buddysearch-logo-1x1.png',
    type: 'image/png',
  },
  'logo-wordmark-1x1': {
    disk: 'logo-wordmark-1x1.png',
    download: 'buddysearch-logo-wordmark-1x1.png',
    type: 'image/png',
  },
  logo: {
    disk: 'logo.png',
    download: 'buddysearch-logo.png',
    type: 'image/png',
  },
};

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  const item = FILES[params.file];
  if (!item) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }

  const buf = await readFile(join(process.cwd(), 'public', item.disk));
  return new NextResponse(buf, {
    headers: {
      'Content-Type': item.type,
      'Content-Disposition': `attachment; filename="${item.download}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
