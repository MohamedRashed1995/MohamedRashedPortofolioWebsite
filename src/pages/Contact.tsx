import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2, AlertCircle, Clock, Mail, MapPin, Briefcase } from 'lucide-react';
import { useSubmitInquiry } from '@/hooks/useSubmitInquiry';
import PageHeader from '@/components/PageHeader';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import type { Inquiry } from '@/types';

export default function Contact() {
  const { submit, loading, error, success, reset } = useSubmitInquiry();
  const { t, isRTL } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    inquiryType: 'General' as Inquiry['inquiryType'],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(false);

  const inquiryTypes: { type: Inquiry['inquiryType']; label: string }[] = [
    { type: 'General', label: t('contact.typeGeneral') },
    { type: 'Hiring', label: t('contact.typeHiring') },
    { type: 'Collaboration', label: t('contact.typeConsulting') },
    { type: 'Code Review', label: t('contact.typeAiEval') },
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = isRTL ? 'الاسم مطلوب' : 'Name is required';
    if (!form.email.trim()) errs.email = isRTL ? 'البريد مطلوب' : 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address';
    }
    if (!form.message.trim()) errs.message = isRTL ? 'الرسالة مطلوبة' : 'Message is required';
    else if (form.message.trim().length < 10) {
      errs.message = isRTL ? 'يجب أن لا تقل الرسالة عن 10 أحرف' : 'Message must be at least 10 characters';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cooldown || loading || success) return;
    if (!validate()) return;

    setCooldown(true);
    await submit(form);
    setTimeout(() => setCooldown(false), 5000);
  };

  const handleReset = () => {
    reset();
    setForm({ name: '', email: '', message: '', inquiryType: 'General' });
  };

  return (
    <PageTransition title="Contact — Mohamed Rashed Abdelazim">
      <PageHeader
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
      />

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Coordinates Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 bg-theme-card border border-theme-border shadow-sm">
              <h3 className="text-base font-bold text-theme-text mb-4">
                {t('contact.directContact')}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-theme-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-theme-text">{t('contact.location')}</p>
                    <p className="text-theme-muted mt-0.5">{t('contact.locationValue')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-theme-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-theme-text">Email</p>
                    <a
                      href={`mailto:${t('contact.emailValue')}`}
                      className="text-theme-accent hover:underline font-mono mt-0.5 block"
                    >
                      {t('contact.emailValue')}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-theme-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-theme-text">{t('contact.availability')}</p>
                    <p className="text-theme-muted mt-0.5">{t('contact.availabilityValue')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-8 text-center bg-theme-card border border-theme-border shadow-md"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-theme-text mb-2">
                    {t('contact.successMessage')}
                  </h2>
                  <p className="text-sm text-theme-muted mb-4">
                    {isRTL
                      ? 'تم تسجيل الاستفسار وتوليد المعرف المرجعي:'
                      : 'Inquiry reference identifier recorded in system:'}
                  </p>
                  <div className="inline-flex flex-col gap-1 text-xs font-mono text-theme-muted bg-theme-bg-sec rounded-xl p-4 border border-theme-border mb-6">
                    <span>
                      <strong className="text-theme-text">ID:</strong> {success.id}
                    </span>
                    <span>
                      <strong className="text-theme-text">Status:</strong> {success.status}
                    </span>
                    <span>
                      <strong className="text-theme-text">Timestamp:</strong>{' '}
                      {new Date(success.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-ghost"
                    >
                      {isRTL ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="card p-6 sm:p-8 space-y-5 bg-theme-card border border-theme-border shadow-sm"
                >
                  <h3 className="text-lg font-bold text-theme-text border-b border-theme-border pb-3">
                    {t('contact.formTitle')}
                  </h3>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-theme-text mb-2">
                      {t('contact.typeLabel')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {inquiryTypes.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setForm({ ...form, inquiryType: item.type })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            form.inquiryType === item.type
                              ? 'border-theme-accent bg-theme-accent-light text-theme-accent font-bold'
                              : 'border-theme-border bg-theme-bg-sec text-theme-muted hover:border-theme-accent/30 hover:text-theme-text'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs sm:text-sm font-semibold text-theme-text mb-1.5"
                    >
                      {t('contact.nameLabel')}
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field text-sm"
                      placeholder={t('contact.namePlaceholder')}
                      aria-invalid={!!validationErrors.name}
                    />
                    {validationErrors.name && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-semibold text-theme-text mb-1.5"
                    >
                      {t('contact.emailLabel')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field text-sm"
                      placeholder={t('contact.emailPlaceholder')}
                      aria-invalid={!!validationErrors.email}
                    />
                    {validationErrors.email && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs sm:text-sm font-semibold text-theme-text mb-1.5"
                    >
                      {t('contact.messageLabel')}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-field resize-none text-sm"
                      placeholder={t('contact.messagePlaceholder')}
                      aria-invalid={!!validationErrors.message}
                    />
                    {validationErrors.message && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {validationErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-300">
                          {isRTL ? 'فشل إرسال الرسالة' : 'Submission Failed'}
                        </p>
                        <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    {cooldown && !loading && (
                      <span className="flex items-center gap-1.5 text-xs text-theme-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'يرجى الانتظار لحظات...' : 'Please wait a moment...'}</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={loading || cooldown}
                      className="btn-primary ms-auto"
                      aria-label="Send message"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{loading ? t('contact.submitting') : t('contact.submitButton')}</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
