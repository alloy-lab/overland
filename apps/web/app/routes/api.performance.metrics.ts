import type { LoaderFunctionArgs } from 'react-router';

// This would typically connect to a real-time data source
// For now, we'll return mock data for development
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const stream = url.searchParams.get('stream') === 'true';

  if (stream) {
    // Return Server-Sent Events for real-time metrics
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    return new Response(
      new ReadableStream({
        start(controller) {
          // Send initial connection message
          controller.enqueue(
            `data: ${JSON.stringify({ type: 'connected' })}\n\n`
          );

          // Simulate performance metrics every 5 seconds
          const interval = setInterval(() => {
            const mockMetric = {
              requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              method: ['GET', 'POST', 'PUT', 'DELETE'][
                Math.floor(Math.random() * 4)
              ],
              url: [
                '/api/pages',
                '/api/site-settings',
                '/api/media',
                '/api/users',
              ][Math.floor(Math.random() * 4)],
              duration: Math.random() * 2000 + 100, // 100ms to 2.1s
              statusCode: [200, 201, 400, 404, 500][
                Math.floor(Math.random() * 5)
              ],
              memoryUsage: {
                rss: Math.random() * 100 * 1024 * 1024 + 50 * 1024 * 1024, // 50-150MB
                heapUsed: Math.random() * 50 * 1024 * 1024 + 20 * 1024 * 1024, // 20-70MB
                heapTotal: Math.random() * 80 * 1024 * 1024 + 40 * 1024 * 1024, // 40-120MB
                external: Math.random() * 10 * 1024 * 1024 + 5 * 1024 * 1024, // 5-15MB
              },
              timestamp: new Date().toISOString(),
            };

            controller.enqueue(`data: ${JSON.stringify(mockMetric)}\n\n`);
          }, 5000);

          // Clean up on close
          request.signal?.addEventListener('abort', () => {
            clearInterval(interval);
            controller.close();
          });
        },
      }),
      { headers }
    );
  }

  // Return static metrics for non-streaming requests
  return new Response(
    JSON.stringify({
      totalRequests: 42,
      averageResponseTime: 245,
      slowRequests: 3,
      memoryUsage: {
        rss: 85 * 1024 * 1024, // 85MB
        heapUsed: 45 * 1024 * 1024, // 45MB
        heapTotal: 70 * 1024 * 1024, // 70MB
        external: 8 * 1024 * 1024, // 8MB
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
