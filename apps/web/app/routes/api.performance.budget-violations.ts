import type { LoaderFunctionArgs } from 'react-router';

// Performance budget configuration
const PERFORMANCE_BUDGETS = {
  maxResponseTime: 2000, // 2 seconds
  maxMemoryUsage: 100 * 1024 * 1024, // 100 MB
  maxBundleSize: 500 * 1024, // 500 KB
  maxImageSize: 2 * 1024 * 1024, // 2 MB
  maxConcurrentRequests: 50,
} as const;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const stream = url.searchParams.get('stream') === 'true';

  if (stream) {
    // Return Server-Sent Events for real-time budget violations
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

          // Simulate budget violations occasionally
          const interval = setInterval(() => {
            // 10% chance of generating a violation
            if (Math.random() < 0.1) {
              const violationTypes = [
                {
                  type: 'response_time',
                  message: `Response time exceeded budget of ${PERFORMANCE_BUDGETS.maxResponseTime}ms`,
                  actual:
                    Math.random() * 1000 + PERFORMANCE_BUDGETS.maxResponseTime,
                  budget: PERFORMANCE_BUDGETS.maxResponseTime,
                },
                {
                  type: 'memory_usage',
                  message: `Memory usage exceeded budget of ${PERFORMANCE_BUDGETS.maxMemoryUsage / 1024 / 1024}MB`,
                  actual:
                    Math.random() * 50 * 1024 * 1024 +
                    PERFORMANCE_BUDGETS.maxMemoryUsage,
                  budget: PERFORMANCE_BUDGETS.maxMemoryUsage,
                },
                {
                  type: 'bundle_size',
                  message: `Bundle size exceeded budget of ${PERFORMANCE_BUDGETS.maxBundleSize / 1024}KB`,
                  actual:
                    Math.random() * 200 * 1024 +
                    PERFORMANCE_BUDGETS.maxBundleSize,
                  budget: PERFORMANCE_BUDGETS.maxBundleSize,
                },
              ];

              const violation =
                violationTypes[
                  Math.floor(Math.random() * violationTypes.length)
                ];
              const budgetViolation = {
                id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...violation,
                severity:
                  violation.actual > violation.budget * 1.5 ? 'high' : 'medium',
                timestamp: new Date().toISOString(),
                url: ['/api/pages', '/api/site-settings', '/api/media'][
                  Math.floor(Math.random() * 3)
                ],
              };

              controller.enqueue(
                `data: ${JSON.stringify(budgetViolation)}\n\n`
              );
            }
          }, 10000); // Check every 10 seconds

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

  // Return static budget violations for non-streaming requests
  return new Response(
    JSON.stringify({
      violations: [
        {
          id: 'violation-1',
          type: 'response_time',
          message: 'Response time exceeded budget of 2000ms',
          actual: 2500,
          budget: PERFORMANCE_BUDGETS.maxResponseTime,
          severity: 'medium',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          url: '/api/pages',
        },
        {
          id: 'violation-2',
          type: 'memory_usage',
          message: 'Memory usage exceeded budget of 100MB',
          actual: 120 * 1024 * 1024,
          budget: PERFORMANCE_BUDGETS.maxMemoryUsage,
          severity: 'high',
          timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          url: '/api/media',
        },
      ],
      budgets: PERFORMANCE_BUDGETS,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
