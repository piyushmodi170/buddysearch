import { FILES, logoDownloadResponse } from '@/lib/logo-download';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  const res = await logoDownloadResponse(params.file);
  if (!res) return new Response('Not found', { status: 404 });
  return res;
}
