import { llmsFullTxt } from '@/lib/llms-full';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
}
