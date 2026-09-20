// // import { useState } from 'react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { Play, Loader2, CheckCircle2 } from 'lucide-react';
// // import type { ApiEndpoint } from '@/types';
// // import { useLanguage } from '@/context/LanguageContext';

// // interface ApiPlaygroundProps {
// //   endpoints: ApiEndpoint[];
// //   projectSlug: string;
// // }

// // export default function ApiPlayground({ endpoints, projectSlug }: ApiPlaygroundProps) {
// //   const { t, isRTL } = useLanguage();
// //   const [selectedPath, setSelectedPath] = useState(endpoints[0]?.path ?? '');
// //   const [response, setResponse] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [statusCode, setStatusCode] = useState<number | null>(null);

// //   const selectedEndpoint = endpoints.find((e) => e.path === selectedPath) || endpoints[0];

// //   const handleSend = async () => {
// //     if (!selectedEndpoint) return;
// //     setLoading(true);
// //     setResponse(null);
// //     setStatusCode(null);

// //     // Simulate clean API call with real seed payload
// //     setTimeout(() => {
// //       setStatusCode(200);
// //       setResponse(JSON.stringify(selectedEndpoint.sampleResponse, null, 2));
// //       setLoading(false);
// //     }, 400);
// //   };

// //   return (
// //     <div className="card overflow-hidden bg-theme-card border border-theme-border shadow-md">
// //       {/* Header Bar */}
// //       <div className="flex items-center justify-between px-5 py-3 border-b border-theme-border bg-theme-bg-sec">
// //         <div className="flex items-center gap-2">
// //           <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
// //           <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
// //           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
// //           <span className="text-xs font-mono text-theme-muted ms-2">
// //             api-sandbox · {projectSlug}
// //           </span>
// //         </div>
// //         <span className="badge badge-success text-[10px]">Active Endpoint</span>
// //       </div>

// //       <div className="p-5 space-y-4">
// //         <div>
// //           <label className="block text-xs font-semibold text-theme-text mb-1.5">
// //             {t('playground.selectEndpoint')}
// //           </label>
// //           <div className="flex flex-col sm:flex-row gap-3">
// //             <select
// //               value={selectedPath}
// //               onChange={(e) => {
// //                 setSelectedPath(e.target.value);
// //                 setResponse(null);
// //                 setStatusCode(null);
// //               }}
// //               className="input-field font-mono text-xs sm:text-sm flex-1 bg-theme-bg"
// //               aria-label="Select API endpoint"
// //             >
// //               {endpoints.map((ep) => (
// //                 <option key={ep.path} value={ep.path}>
// //                   {ep.method} {ep.path}
// //                 </option>
// //               ))}
// //             </select>

// //             <button
// //               type="button"
// //               onClick={handleSend}
// //               disabled={loading}
// //               className="btn-primary sm:w-auto justify-center"
// //               aria-label="Send request"
// //             >
// //               {loading ? (
// //                 <Loader2 className="w-4 h-4 animate-spin" />
// //               ) : (
// //                 <Play className="w-4 h-4" />
// //               )}
// //               <span>{loading ? t('playground.sending') : t('playground.sendRequest')}</span>
// //             </button>
// //           </div>
// //         </div>

// //         {selectedEndpoint && (
// //           <p className="text-xs text-theme-muted">{selectedEndpoint.description}</p>
// //         )}

// //         {/* Output area */}
// //         <div className="mt-4 pt-4 border-t border-theme-border">
// //           <AnimatePresence mode="wait">
// //             {loading && (
// //               <motion.div
// //                 key="loading"
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 exit={{ opacity: 0 }}
// //                 className="flex items-center gap-2 text-sm text-theme-muted py-8 justify-center"
// //               >
// //                 <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
// //                 <span>{t('playground.sending')}</span>
// //               </motion.div>
// //             )}

// //             {response && !loading && (
// //               <motion.div
// //                 key="response"
// //                 initial={{ opacity: 0, y: 5 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 exit={{ opacity: 0 }}
// //               >
// //                 <div className="flex items-center justify-between gap-2 mb-2 text-xs">
// //                   <div className="flex items-center gap-2">
// //                     <span className="badge badge-success flex items-center gap-1">
// //                       <CheckCircle2 className="w-3 h-3" />
// //                       <span>{statusCode} OK</span>
// //                     </span>
// //                     <span className="text-theme-muted font-mono">application/json</span>
// //                   </div>
// //                   <span className="text-theme-muted font-mono text-[10px]">
// //                     latency: ~18ms
// //                   </span>
// //                 </div>
// //                 <pre className="rounded-xl bg-theme-bg border border-theme-border p-4 overflow-x-auto text-xs font-mono text-theme-accent leading-relaxed max-h-80 shadow-inner">
// //                   <code>{response}</code>
// //                 </pre>
// //               </motion.div>
// //             )}

// //             {!loading && !response && (
// //               <div className="py-8 text-center text-xs text-theme-muted">
// //                 {isRTL
// //                   ? 'اختر نقطة النهاية واضغط على "إرسال الطلب" لمعاينة استجابة JSON المحاكية.'
// //                   : 'Select an endpoint above and click "Send Request" to execute live simulation.'}
// //               </div>
// //             )}
// //           </AnimatePresence>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Play, Loader2, CheckCircle2, AlertCircle, Radio, Sparkles, ShieldCheck } from 'lucide-react';
// import type { ApiEndpoint } from '@/types';
// import { useLanguage } from '@/context/LanguageContext';
// import { buildApiUrl } from '@/services/api';

// interface ApiPlaygroundProps {
//   endpoints: ApiEndpoint[];
//   projectSlug: string;
// }

// type PlaygroundMode = 'live' | 'sandbox';

// export default function ApiPlayground({ endpoints, projectSlug }: ApiPlaygroundProps) {
//   const { t, isRTL } = useLanguage();
//   const [mode, setMode] = useState<PlaygroundMode>('live');
//   const [selectedPath, setSelectedPath] = useState(endpoints[0]?.path ?? '');
//   const [response, setResponse] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [statusCode, setStatusCode] = useState<number | null>(null);
//   const [statusText, setStatusText] = useState<string | null>(null);
//   const [latencyMs, setLatencyMs] = useState<number | null>(null);
//   const [isError, setIsError] = useState<boolean>(false);
//   const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

//   // Safe allowlist: Only GET requests are allowed in the public playground
//   const getEndpoints = endpoints.filter((e) => e.method.toUpperCase() === 'GET');
//   const activeList = getEndpoints.length > 0 ? getEndpoints : endpoints;
//   const selectedEndpoint = activeList.find((e) => e.path === selectedPath) || activeList[0];

//   const handleSend = async () => {
//     if (!selectedEndpoint) return;
//     setLoading(true);
//     setResponse(null);
//     setStatusCode(null);
//     setStatusText(null);
//     setLatencyMs(null);
//     setIsError(false);

//     // Enforce GET-only safety rule
//     if (selectedEndpoint.method.toUpperCase() !== 'GET') {
//       setIsError(true);
//       setStatusCode(403);
//       setStatusText('Forbidden');
//       setResponse(
//         JSON.stringify(
//           {
//             success: false,
//             error: 'The API Playground is read-only. Mutation methods (POST, PUT, DELETE) are not permitted in public demonstration mode.',
//           },
//           null,
//           2
//         )
//       );
//       setLoading(false);
//       return;
//     }

//     if (mode === 'sandbox') {
//       // SIMULATED SANDBOX MODE
//       setResolvedUrl(`sandbox://${projectSlug}${selectedEndpoint.path}`);
//       const startTime = performance.now();
//       setTimeout(() => {
//         const elapsed = Math.round(performance.now() - startTime);
//         setStatusCode(200);
//         setStatusText('OK (Simulated)');
//         setLatencyMs(Math.max(12, elapsed));
//         setResponse(JSON.stringify(selectedEndpoint.sampleResponse, null, 2));
//         setIsError(false);
//         setLoading(false);
//       }, 250);
//       return;
//     }

//     // LIVE PRODUCTION API MODE
//     const targetUrl = buildApiUrl(selectedEndpoint.path);
//     setResolvedUrl(targetUrl);
//     const startTime = performance.now();

//     try {
//       const res = await fetch(targetUrl, {
//         method: 'GET',
//         headers: {
//           Accept: 'application/json',
//         },
//       });

//       const elapsed = Math.round(performance.now() - startTime);
//       setLatencyMs(elapsed);
//       setStatusCode(res.status);
//       setStatusText(res.statusText || (res.ok ? 'OK' : 'Error'));

//       const contentType = res.headers.get('content-type') || '';
//       if (contentType.includes('application/json')) {
//         const json = await res.json();
//         setResponse(JSON.stringify(json, null, 2));
//       } else {
//         const text = await res.text();
//         setResponse(text || '(Empty response)');
//       }

//       setIsError(!res.ok);
//     } catch (err) {
//       const elapsed = Math.round(performance.now() - startTime);
//       setLatencyMs(elapsed);
//       setIsError(true);
//       setStatusCode(0);
//       setStatusText('Network Error');
//       setResponse(
//         JSON.stringify(
//           {
//             error: 'Request failed to reach live backend.',
//             details: err instanceof Error ? err.message : String(err),
//             tip: 'If running locally or behind CORS restrictions, ensure the backend is active or switch to Simulated Sandbox mode.',
//           },
//           null,
//           2
//         )
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="card overflow-hidden bg-theme-card border border-theme-border shadow-md">
//       {/* Header Bar with Mode Selector */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-theme-border bg-theme-bg-sec">
//         <div className="flex items-center gap-2">
//           <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
//           <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
//           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
//           <span className="text-xs font-mono text-theme-muted ms-2">
//             api-playground · {projectSlug}
//           </span>
//         </div>

//         {/* Mode Segmented Control */}
//         <div className="flex items-center gap-1.5 p-1 bg-theme-bg border border-theme-border rounded-lg text-xs">
//           <button
//             type="button"
//             onClick={() => {
//               setMode('live');
//               setResponse(null);
//               setStatusCode(null);
//             }}
//             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
//               mode === 'live'
//                 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
//                 : 'text-theme-muted hover:text-theme-text'
//             }`}
//           >
//             <Radio className={`w-3.5 h-3.5 ${mode === 'live' ? 'animate-pulse text-emerald-500' : ''}`} />
//             <span>LIVE API</span>
//             <span className="hidden md:inline opacity-75 font-normal">(RunASP Production)</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => {
//               setMode('sandbox');
//               setResponse(null);
//               setStatusCode(null);
//             }}
//             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
//               mode === 'sandbox'
//                 ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs'
//                 : 'text-theme-muted hover:text-theme-text'
//             }`}
//           >
//             <Sparkles className="w-3.5 h-3.5" />
//             <span>SIMULATED SANDBOX</span>
//           </button>
//         </div>
//       </div>

//       {/* Mode Explanatory Notice */}
//       <div className="px-5 py-2.5 bg-theme-bg/50 border-b border-theme-border/60 flex items-center justify-between text-xs text-theme-muted">
//         <div className="flex items-center gap-2">
//           {mode === 'live' ? (
//             <>
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
//               <span>
//                 {isRTL
//                   ? 'وضع الـ Live API: يُرسل طلبات HTTP حقيقية مباشرة إلى الخادم السحابي بالإنتاج (مقتصر على GET الآمنة).'
//                   : 'Live API Mode: Dispatches real HTTP requests directly to the production backend (GET-only allowlist).'}
//               </span>
//             </>
//           ) : (
//             <>
//               <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
//               <span>
//                 {isRTL
//                   ? 'وضع المحاكاة (Sandbox): استجابات موثوقة ومثالية مستندة إلى نماذج البيانات المعتمدة للتجربة الفورية.'
//                   : 'Simulated Sandbox: Deterministic mock responses based on verified schema payloads for instant testing.'}
//               </span>
//             </>
//           )}
//         </div>
//         <div className="hidden sm:flex items-center gap-1 text-[11px] text-theme-muted font-mono">
//           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
//           <span>Read-Only Guard</span>
//         </div>
//       </div>

//       <div className="p-5 space-y-4">
//         <div>
//           <label className="block text-xs font-semibold text-theme-text mb-1.5">
//             {t('playground.selectEndpoint')}
//           </label>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <select
//               value={selectedPath}
//               onChange={(e) => {
//                 setSelectedPath(e.target.value);
//                 setResponse(null);
//                 setStatusCode(null);
//               }}
//               className="input-field font-mono text-xs sm:text-sm flex-1 bg-theme-bg"
//               aria-label="Select API endpoint"
//             >
//               {activeList.map((ep) => (
//                 <option key={ep.path} value={ep.path}>
//                   {ep.method} {ep.path}
//                 </option>
//               ))}
//             </select>

//             <button
//               type="button"
//               onClick={handleSend}
//               disabled={loading}
//               className={`btn-primary sm:w-auto justify-center ${
//                 mode === 'live' ? 'border-emerald-500/40' : ''
//               }`}
//               aria-label="Send request"
//             >
//               {loading ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Play className="w-4 h-4" />
//               )}
//               <span>{loading ? t('playground.sending') : t('playground.sendRequest')}</span>
//             </button>
//           </div>
//         </div>

//         {selectedEndpoint && (
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
//             <p className="text-theme-muted">{selectedEndpoint.description}</p>
//             {resolvedUrl && (
//               <span className="font-mono text-[11px] text-theme-muted/80 truncate max-w-md">
//                 URL: {resolvedUrl}
//               </span>
//             )}
//           </div>
//         )}

//         {/* Output Area */}
//         <div className="mt-4 pt-4 border-t border-theme-border">
//           <AnimatePresence mode="wait">
//             {loading && (
//               <motion.div
//                 key="loading"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="flex items-center gap-2 text-sm text-theme-muted py-8 justify-center"
//               >
//                 <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
//                 <span>
//                   {mode === 'live'
//                     ? (isRTL ? 'جاري الاتصال بالـ API الحقيقي...' : 'Dispatching live HTTP request...')
//                     : t('playground.sending')}
//                 </span>
//               </motion.div>
//             )}

//             {response && !loading && (
//               <motion.div
//                 key="response"
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//               >
//                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
//                   <div className="flex items-center gap-2">
//                     {/* Execution Environment Badge */}
//                     {mode === 'live' ? (
//                       <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
//                         LIVE • PRODUCTION API
//                       </span>
//                     ) : (
//                       <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
//                         SIMULATED • SANDBOX
//                       </span>
//                     )}

//                     {/* Status Badge */}
//                     <span
//                       className={`badge flex items-center gap-1 ${
//                         isError
//                           ? 'badge-error bg-red-500/15 text-red-500 border border-red-500/30'
//                           : 'badge-success'
//                       }`}
//                     >
//                       {isError ? (
//                         <AlertCircle className="w-3 h-3" />
//                       ) : (
//                         <CheckCircle2 className="w-3 h-3" />
//                       )}
//                       <span>
//                         {statusCode ? `${statusCode} ${statusText}` : statusText}
//                       </span>
//                     </span>

//                     <span className="text-theme-muted font-mono">application/json</span>
//                   </div>

//                   {latencyMs !== null && (
//                     <span className="text-theme-muted font-mono text-[11px]">
//                       latency: {latencyMs}ms
//                     </span>
//                   )}
//                 </div>

//                 <pre className="rounded-xl bg-theme-bg border border-theme-border p-4 overflow-x-auto text-xs font-mono text-theme-accent leading-relaxed max-h-80 shadow-inner">
//                   <code>{response}</code>
//                 </pre>
//               </motion.div>
//             )}

//             {!loading && !response && (
//               <div className="py-8 text-center text-xs text-theme-muted">
//                 {mode === 'live'
//                   ? (isRTL
//                       ? 'اضغط على "إرسال الطلب" لتنفيذ استدعاء HTTP حي ومباشر إلى الـ Backend بالإنتاج.'
//                       : 'Click "Send Request" to execute a live, production HTTP call to the active backend.')
//                   : (isRTL
//                       ? 'اختر نقطة النهاية واضغط على "إرسال الطلب" لمعاينة استجابة JSON المحاكية.'
//                       : 'Select an endpoint above and click "Send Request" to execute sandbox simulation.')}
//               </div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { ApiEndpoint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ApiPlaygroundProps {
  endpoints: ApiEndpoint[];
  projectSlug: string;
}

type PlaygroundMode = 'live' | 'sandbox';

interface PlaygroundResult {
  statusCode: number;
  statusText: string;
  contentType: string;
  body: string;
  latencyMs: number;
  url: string;
}

const PROD_BACKEND_URL =
  'https://mohamedrashedportofolio.runasp.net';

const LIVE_ALLOWED_EXACT_PATHS = new Set([
  '/api/v1/projects',
  '/api/v1/technologies',
  '/api/v1/github/metrics',
  '/api/v1/ai/cases',
  '/api/playground/adros/courses',
  '/api/playground/helpdesk/tickets',
  '/api/playground/dentzone/appointments',
]);

const REQUEST_TIMEOUT_MS = 10000;

function normalizePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    return '';
  }

  const normalized =
    trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function isLivePathAllowed(path: string): boolean {
  const normalized = normalizePath(path);

  if (LIVE_ALLOWED_EXACT_PATHS.has(normalized)) {
    return true;
  }

  // Public project details endpoint
  if (/^\/api\/v1\/projects\/[^/]+$/.test(normalized)) {
    return true;
  }

  // Public project schema endpoint
  if (/^\/api\/v1\/projects\/[^/]+\/schema$/.test(normalized)) {
    return true;
  }

  return false;
}

function buildLiveUrl(path: string): string {
  return `${PROD_BACKEND_URL}${normalizePath(path)}`;
}

async function parseResponseBody(
  response: Response,
): Promise<{
  body: string;
  contentType: string;
}> {
  const contentType =
    response.headers.get('content-type') || '';

  const text = await response.text();

  if (!text) {
    return {
      body: '',
      contentType,
    };
  }

  if (contentType.includes('application/json')) {
    try {
      const json: unknown = JSON.parse(text);

      return {
        body: JSON.stringify(json, null, 2),
        contentType,
      };
    } catch {
      return {
        body: text,
        contentType,
      };
    }
  }

  return {
    body: text,
    contentType,
  };
}

export default function ApiPlayground({
  endpoints,
  projectSlug,
}: ApiPlaygroundProps) {
  const { t, isRTL } = useLanguage();

  const [mode, setMode] =
    useState<PlaygroundMode>('live');

  const [selectedPath, setSelectedPath] =
    useState(endpoints[0]?.path ?? '');

  const [result, setResult] =
    useState<PlaygroundResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const sandboxEndpoints = useMemo(
    () =>
      endpoints.filter(
        (endpoint) =>
          endpoint.method.toUpperCase() === 'GET',
      ),
    [endpoints],
  );

  const liveEndpoints = useMemo(
    () =>
      sandboxEndpoints.filter((endpoint) =>
        isLivePathAllowed(endpoint.path),
      ),
    [sandboxEndpoints],
  );

  const activeEndpoints =
    mode === 'live'
      ? liveEndpoints
      : sandboxEndpoints;

  const selectedEndpoint =
    activeEndpoints.find(
      (endpoint) =>
        endpoint.path === selectedPath,
    ) ?? activeEndpoints[0];

  useEffect(() => {
    const firstPath =
      activeEndpoints[0]?.path ?? '';

    setSelectedPath(firstPath);
    setResult(null);
  }, [activeEndpoints]);

  const handleModeChange = (
    nextMode: PlaygroundMode,
  ) => {
    setMode(nextMode);
    setResult(null);
  };

  const handleSend = async () => {
    if (!selectedEndpoint) {
      return;
    }

    const method =
      selectedEndpoint.method.toUpperCase();

    setResult(null);
    setLoading(true);

    if (method !== 'GET') {
      setResult({
        statusCode: 403,
        statusText: 'Forbidden',
        contentType: 'application/json',
        body: JSON.stringify(
          {
            success: false,
            error:
              'The public API Playground is read-only. Only GET requests are allowed.',
          },
          null,
          2,
        ),
        latencyMs: 0,
        url: selectedEndpoint.path,
      });

      setLoading(false);
      return;
    }

    const normalizedPath =
      normalizePath(selectedEndpoint.path);

    if (
      mode === 'live' &&
      !isLivePathAllowed(normalizedPath)
    ) {
      setResult({
        statusCode: 403,
        statusText: 'Forbidden',
        contentType: 'application/json',
        body: JSON.stringify(
          {
            success: false,
            error:
              'This endpoint is not allow-listed for Live Production mode.',
          },
          null,
          2,
        ),
        latencyMs: 0,
        url: normalizedPath,
      });

      setLoading(false);
      return;
    }

    if (mode === 'sandbox') {
      const startedAt = performance.now();

      window.setTimeout(() => {
        const latencyMs = Math.max(
          15,
          Math.round(
            performance.now() - startedAt,
          ),
        );

        setResult({
          statusCode: 200,
          statusText: 'OK (Simulated)',
          contentType: 'application/json',
          body: JSON.stringify(
            selectedEndpoint.sampleResponse,
            null,
            2,
          ),
          latencyMs,
          url: `sandbox://${projectSlug}${normalizedPath}`,
        });

        setLoading(false);
      }, 250);

      return;
    }

    const url = buildLiveUrl(normalizedPath);
    const controller = new AbortController();

    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    const startedAt = performance.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      const latencyMs = Math.round(
        performance.now() - startedAt,
      );

      const parsed =
        await parseResponseBody(response);

      setResult({
        statusCode: response.status,
        statusText:
          response.statusText ||
          (response.ok ? 'OK' : 'Error'),
        contentType:
          parsed.contentType ||
          'unknown',
        body:
          parsed.body ||
          '(Empty response)',
        latencyMs,
        url,
      });
    } catch (error: unknown) {
      const latencyMs = Math.round(
        performance.now() - startedAt,
      );

      const message =
        error instanceof DOMException &&
        error.name === 'AbortError'
          ? `Request timed out after ${
              REQUEST_TIMEOUT_MS / 1000
            } seconds.`
          : error instanceof Error
            ? error.message
            : 'Unable to reach the production API.';

      setResult({
        statusCode: 0,
        statusText: 'Network Error',
        contentType: 'text/plain',
        body: message,
        latencyMs,
        url,
      });
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden bg-theme-card border border-theme-border shadow-md">
      <div className="flex flex-col gap-3 px-5 py-3 border-b border-theme-border bg-theme-bg-sec sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80" />

          <span className="text-xs font-mono text-theme-muted ms-2">
            api-playground · {projectSlug}
          </span>
        </div>

        <div
          className="flex items-center gap-1 p-1 text-xs border rounded-lg bg-theme-bg border-theme-border"
          role="group"
          aria-label="API Playground mode"
        >
          <button
            type="button"
            onClick={() =>
              handleModeChange('live')
            }
            disabled={loading}
            aria-pressed={mode === 'live'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'live'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                mode === 'live'
                  ? 'text-emerald-500 animate-pulse'
                  : ''
              }`}
            />
            <span>LIVE API</span>
            <span className="hidden md:inline opacity-75">
              (RunASP Production)
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleModeChange('sandbox')
            }
            disabled={loading}
            aria-pressed={mode === 'sandbox'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'sandbox'
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMULATED SANDBOX</span>
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-theme-bg/50 border-b border-theme-border/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-theme-muted">
            {mode === 'live' ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {isRTL
                    ? 'Live API: استدعاء HTTP حقيقي للـ Backend على RunASP — GET فقط.'
                    : 'Live API: real HTTP request to the RunASP production backend — GET only.'}
                </span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
                <span>
                  {isRTL
                    ? 'Sandbox: استجابة محاكاة آمنة للمعاينة فقط.'
                    : 'Sandbox: simulated response for safe preview only.'}
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-theme-muted font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>GET-only</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block mb-1.5 text-xs font-semibold text-theme-text">
            {t('playground.selectEndpoint')}
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={
                selectedEndpoint?.path ?? ''
              }
              onChange={(event) => {
                setSelectedPath(
                  event.target.value,
                );
                setResult(null);
              }}
              disabled={
                loading ||
                activeEndpoints.length === 0
              }
              className="flex-1 input-field font-mono text-xs sm:text-sm bg-theme-bg"
              aria-label="Select API endpoint"
            >
              {activeEndpoints.map(
                (endpoint) => (
                  <option
                    key={`${endpoint.method}-${endpoint.path}`}
                    value={endpoint.path}
                  >
                    {endpoint.method}{' '}
                    {endpoint.path}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading ||
                !selectedEndpoint
              }
              className="btn-primary sm:w-auto justify-center"
              aria-label="Send request"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}

              <span>
                {loading
                  ? t('playground.sending')
                  : t('playground.sendRequest')}
              </span>
            </button>
          </div>

          {mode === 'live' &&
            activeEndpoints.length === 0 && (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                {isRTL
                  ? 'لا توجد نقطة GET آمنة ومسموح بها لهذا المشروع في وضع Live.'
                  : 'No safe allow-listed GET endpoint is available for this project in Live mode.'}
              </p>
            )}
        </div>

        {selectedEndpoint && (
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-theme-muted">
              {selectedEndpoint.description}
            </p>

            {mode === 'live' && (
              <span className="font-mono text-[11px] text-theme-muted/80 truncate">
                {buildLiveUrl(
                  selectedEndpoint.path,
                )}
              </span>
            )}
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-theme-border">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-8 text-sm text-theme-muted"
              >
                <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />

                <span>
                  {mode === 'live'
                    ? isRTL
                      ? 'جاري الاتصال بالـ API الحقيقي...'
                      : 'Dispatching live HTTP request...'
                    : t('playground.sending')}
                </span>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col gap-3 mb-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {result.statusCode >= 200 &&
                    result.statusCode < 300 ? (
                      <span className="flex items-center gap-1 badge badge-success">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {result.statusCode}{' '}
                          {result.statusText}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 badge badge-error">
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          {result.statusCode === 0
                            ? result.statusText
                            : `${result.statusCode} ${result.statusText}`}
                        </span>
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        mode === 'live'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {mode === 'live'
                        ? 'LIVE • PRODUCTION API'
                        : 'SIMULATED • SANDBOX'}
                    </span>

                    <span className="font-mono text-theme-muted">
                      {result.contentType ||
                        'unknown'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-theme-muted">
                    latency: {result.latencyMs}ms
                  </span>
                </div>

                <div className="mb-2 text-[10px] font-mono text-theme-muted break-all">
                  {result.url}
                </div>

                <pre className="max-h-80 overflow-x-auto rounded-xl bg-theme-bg border border-theme-border p-4 text-xs font-mono text-theme-accent leading-relaxed shadow-inner">
                  <code>{result.body}</code>
                </pre>
              </motion.div>
            )}

            {!loading && !result && (
              <div className="py-8 text-center text-xs text-theme-muted">
                {mode === 'live'
                  ? isRTL
                    ? 'اختر GET endpoint واضغط "إرسال الطلب" لتنفيذ استدعاء حقيقي على الإنتاج.'
                    : 'Select a safe GET endpoint and click "Send Request" to execute a real production API call.'
                  : isRTL
                    ? 'اختر endpoint واضغط "إرسال الطلب" لمعاينة استجابة Sandbox محاكاة.'
                    : 'Select an endpoint and click "Send Request" to preview a simulated Sandbox response.'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
