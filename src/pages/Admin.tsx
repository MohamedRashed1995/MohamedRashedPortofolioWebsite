import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Inbox, BarChart3, FolderKanban, Loader2, LogOut, Globe, Image as ImageIcon } from 'lucide-react';
import { useInquiries } from '@/hooks/useInquiries';
import { loginAdmin, updateInquiryStatus } from '@/services/api';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { AdminImageManager } from '@/components/AdminImageManager';

export default function Admin() {
  const { t, isRTL } = useLanguage();
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem('admin_access_token')));
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'media' | 'projects' | 'metrics'>('inquiries');
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: inquiries, loading: inquiriesLoading, error: inquiriesError, reload } = useInquiries(authed);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await loginAdmin(email, password);
      localStorage.setItem('admin_access_token', result.accessToken);
      setAuthed(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'New' | 'Read' | 'Archived') => {
    setStatusLoading(id);
    try {
      await updateInquiryStatus(id, status);
      await reload();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to update inquiry status.');
    } finally {
      setStatusLoading(null);
    }
  };

  if (!authed) {
    return (
      <PageTransition title="Admin Login — Mohamed Rashed Abdelazim">
        <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-16">
          <div className="card p-8 w-full max-w-md bg-theme-card border border-theme-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-theme-accent-light border border-theme-border flex items-center justify-center">
                <Lock className="w-5 h-5 text-theme-accent" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-theme-text">{t('admin.loginTitle')}</h1>
                <p className="text-xs text-theme-muted">{t('admin.loginSubtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-theme-text mb-1.5">
                  {t('admin.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field ps-10 text-sm"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-theme-text mb-1.5">
                  {t('admin.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field ps-10 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full justify-center"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{authLoading ? t('admin.loggingIn') : t('admin.loginBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    { id: 'inquiries' as const, label: t('admin.inquiriesTitle'), icon: Inbox },
    { id: 'media' as const, label: isRTL ? 'الصور والوسائط' : 'Media & Avatar', icon: ImageIcon },
    { id: 'projects' as const, label: t('nav.projects'), icon: FolderKanban },
    { id: 'metrics' as const, label: isRTL ? 'المقاييس' : 'Metrics', icon: BarChart3 },
  ];

  return (
    <PageTransition title="Admin Dashboard — Mohamed Rashed Abdelazim">
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text">{t('admin.title')}</h1>
              <p className="text-sm text-theme-muted mt-1">{t('admin.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-ghost text-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isRTL ? 'معاينة الموقع' : 'View Site'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('admin_access_token');
                  setAuthed(false);
                }}
                className="btn-ghost text-xs text-red-400 hover:text-red-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-theme-border pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-theme-accent text-white shadow-sm'
                    : 'text-theme-muted hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-theme-muted font-mono">
                  {inquiries.length} {isRTL ? 'استفسار مسجل' : 'inquiries recorded'}
                </p>
                <button
                  type="button"
                  onClick={reload}
                  className="btn-ghost text-xs"
                >
                  {isRTL ? 'تحديث البيانات' : 'Refresh'}
                </button>
              </div>

              {inquiriesLoading && <div className="card p-8 animate-pulse h-40 bg-theme-card" />}
              {inquiriesError && <p className="text-sm text-red-400">{inquiriesError}</p>}

              {!inquiriesLoading && !inquiriesError && inquiries.length === 0 && (
                <div className="card p-12 text-center bg-theme-card border border-theme-border">
                  <Inbox className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                  <p className="text-sm text-theme-muted">{t('admin.noInquiries')}</p>
                </div>
              )}

              {!inquiriesLoading && !inquiriesError && inquiries.length > 0 && (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="card p-4 sm:p-5 bg-theme-card border border-theme-border shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-sm font-bold text-theme-text">{inq.name}</span>
                          <span className="text-xs text-theme-muted ms-2 font-mono">{inq.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-accent">{inq.inquiryType}</span>
                          <select
                            value={inq.status}
                            disabled={statusLoading === inq.id}
                            onChange={(event) =>
                              handleStatusChange(
                                inq.id,
                                event.target.value as 'New' | 'Read' | 'Archived'
                              )
                            }
                            className="input-field py-1 text-xs font-mono"
                            aria-label={`Status for ${inq.name}`}
                          >
                            <option value="New">{t('admin.statusPending')}</option>
                            <option value="Read">{t('admin.statusReviewed')}</option>
                            <option value="Archived">{t('admin.statusArchived')}</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-theme-text-sec mt-2 leading-relaxed bg-theme-bg-sec/50 p-3 rounded-lg border border-theme-border">
                        {inq.message}
                      </p>
                      <p className="text-[11px] text-theme-muted font-mono mt-2">
                        {new Date(inq.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <AdminImageManager />
          )}

          {activeTab === 'projects' && (
            <div className="card p-12 text-center bg-theme-card border border-theme-border">
              <FolderKanban className="w-8 h-8 text-theme-muted mx-auto mb-2" />
              <p className="text-sm text-theme-muted">
                {isRTL
                  ? 'إدارة المشاريع متصلة بالمستودع وقاعدة البيانات المركزية.'
                  : 'Project synchronizer integrated with production storage and GitHub sync.'}
              </p>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="card p-12 text-center bg-theme-card border border-theme-border">
              <BarChart3 className="w-8 h-8 text-theme-muted mx-auto mb-2" />
              <p className="text-sm text-theme-muted">
                {isRTL
                  ? 'مؤشرات الأداء وتحليلات الزيارات للأنظمة والمشاريع.'
                  : 'Real-time telemetry and API invocation monitoring.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
