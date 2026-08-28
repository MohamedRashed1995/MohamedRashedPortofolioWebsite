import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';
import type { ApiEndpoint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ApiPlaygroundProps {
  endpoints: ApiEndpoint[];
  projectSlug: string;
}

export default function ApiPlayground({ endpoints, projectSlug }: ApiPlaygroundProps) {
  const { t, isRTL } = useLanguage();
  const [selectedPath, setSelectedPath] = useState(endpoints[0]?.path ?? '');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const selectedEndpoint = endpoints.find((e) => e.path === selectedPath) || endpoints[0];

  const handleSend = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);
    setResponse(null);
    setStatusCode(null);

    // Simulate clean API call with real seed payload
    setTimeout(() => {
      setStatusCode(200);
      setResponse(JSON.stringify(selectedEndpoint.sampleResponse, null, 2));
      setLoading(false);
    }, 400);
  };

  return (
    <div className="card overflow-hidden bg-theme-card border border-theme-border shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-theme-border bg-theme-bg-sec">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-xs font-mono text-theme-muted ms-2">
            api-sandbox · {projectSlug}
          </span>
        </div>
        <span className="badge badge-success text-[10px]">Active Endpoint</span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-theme-text mb-1.5">
            {t('playground.selectEndpoint')}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPath}
              onChange={(e) => {
                setSelectedPath(e.target.value);
                setResponse(null);
                setStatusCode(null);
              }}
              className="input-field font-mono text-xs sm:text-sm flex-1 bg-theme-bg"
              aria-label="Select API endpoint"
            >
              {endpoints.map((ep) => (
                <option key={ep.path} value={ep.path}>
                  {ep.method} {ep.path}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="btn-primary sm:w-auto justify-center"
              aria-label="Send request"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{loading ? t('playground.sending') : t('playground.sendRequest')}</span>
            </button>
          </div>
        </div>

        {selectedEndpoint && (
          <p className="text-xs text-theme-muted">{selectedEndpoint.description}</p>
        )}

        {/* Output area */}
        <div className="mt-4 pt-4 border-t border-theme-border">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-theme-muted py-8 justify-center"
              >
                <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
                <span>{t('playground.sending')}</span>
              </motion.div>
            )}

            {response && !loading && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{statusCode} OK</span>
                    </span>
                    <span className="text-theme-muted font-mono">application/json</span>
                  </div>
                  <span className="text-theme-muted font-mono text-[10px]">
                    latency: ~18ms
                  </span>
                </div>
                <pre className="rounded-xl bg-theme-bg border border-theme-border p-4 overflow-x-auto text-xs font-mono text-theme-accent leading-relaxed max-h-80 shadow-inner">
                  <code>{response}</code>
                </pre>
              </motion.div>
            )}

            {!loading && !response && (
              <div className="py-8 text-center text-xs text-theme-muted">
                {isRTL
                  ? 'اختر نقطة النهاية واضغط على "إرسال الطلب" لمعاينة استجابة JSON المحاكية.'
                  : 'Select an endpoint above and click "Send Request" to execute live simulation.'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
