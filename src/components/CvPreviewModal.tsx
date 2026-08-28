import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { downloadCvPdf } from '@/utils/downloadCv';
import { useLanguage } from '@/context/LanguageContext';

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CvPreviewModal: React.FC<CvPreviewModalProps> = ({ isOpen, onClose }) => {
  const { isRTL } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadCvPdf('Mohamed_Rashed_CV.pdf');
    setDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl h-[90vh] bg-theme-card border border-theme-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border bg-theme-bg-sec/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center">
                  <FileText className="w-5 h-5 text-theme-accent" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-theme-text leading-none">
                    Mohamed_Rashed_CV.pdf
                  </h3>
                  <p className="text-xs text-theme-muted mt-1">
                    {isRTL ? 'معاينة وتحميل السيرة الذاتية الرسمية' : 'Official Full-Stack .NET & AI Resume'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary text-xs py-1.5 px-3 shadow-md"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : downloaded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloaded ? (isRTL ? 'تم التحميل!' : 'Downloaded!') : (isRTL ? 'تحميل PDF' : 'Download PDF')}</span>
                </button>

                <a
                  href="/Mohamed_Rashed_CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs py-1.5 px-2.5 hidden sm:inline-flex"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg-hover transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 w-full bg-slate-900/60 p-1 sm:p-2 overflow-hidden flex flex-col">
              <iframe
                src="/Mohamed_Rashed_CV.pdf#toolbar=1&navpanes=0&scrollbar=1"
                title="Mohamed Rashed CV"
                className="w-full h-full rounded-xl border border-theme-border bg-white"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
