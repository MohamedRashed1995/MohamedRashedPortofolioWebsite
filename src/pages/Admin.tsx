import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Lock,
  Mail,
  ShieldCheck,
  Inbox,
  BarChart3,
  FolderKanban,
  Loader2,
  LogOut,
  Globe,
  Image as ImageIcon,
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useInquiries } from '@/hooks/useInquiries';
import { useProjects } from '@/hooks/useProjects';
import {
  loginAdmin,
  logoutAdmin,
  updateInquiryStatus,
  getAdminToken,
  createProject,
  updateProject,
  deleteProject,
  type ProjectCreateInput,
  type ProjectUpdateInput,
} from '@/services/api';
import type { Project } from '@/types';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { AdminImageManager } from '@/components/AdminImageManager';

export default function Admin() {
  const { t, isRTL } = useLanguage();
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'media' | 'projects' | 'metrics'>('inquiries');
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  // Project dialog state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [projectForm, setProjectForm] = useState<ProjectCreateInput>({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    role: 'Full-Stack Engineer',
    featured: false,
    displayOrder: 0,
    technologyNames: [],
    metrics: [],
    endpoints: [],
    architectureLayers: [],
  });

  const isRTLRef = useRef(isRTL);
  useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  const handleUnauthorized = useCallback(() => {
    logoutAdmin();
    setAuthed(false);
    setAuthError(isRTLRef.current ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.' : 'Session expired. Please log in again.');
  }, []);

  const {
    data: inquiries,
    loading: inquiriesLoading,
    error: inquiriesError,
    reload,
  } = useInquiries(authed, handleUnauthorized);

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    reload: reloadProjects,
  } = useProjects();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginAdmin(email, password);
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const handleStatusChange = async (id: string, status: 'New' | 'Read' | 'Archived') => {
    setStatusLoading(id);
    try {
      await updateInquiryStatus(id, status);
      await reload();
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('unauthorized')) {
        handleUnauthorized();
      } else {
        setAuthError(err instanceof Error ? err.message : 'Unable to update inquiry status.');
      }
    } finally {
      setStatusLoading(null);
    }
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      role: 'Full-Stack Engineer',
      featured: false,
      displayOrder: 0,
      technologyNames: [],
      metrics: [],
      endpoints: [],
      architectureLayers: [],
    });
    setTagsInput('');
    setProjectError(null);
    setProjectDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.longDescription || project.shortDescription,
      role: project.role || 'Full-Stack Engineer',
      featured: project.featured,
      displayOrder: project.displayOrder ?? 0,
      technologyNames: project.tags || [],
      metrics: [],
      endpoints: [],
      architectureLayers: [],
    });
    setTagsInput((project.tags || []).join(', '));
    setProjectError(null);
    setProjectDialogOpen(true);
  };

  const handleSaveProject = async () => {
    setSavingProject(true);
    setProjectError(null);
    try {
      const techNames = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const payload: ProjectCreateInput = { ...projectForm, technologyNames: techNames };
      if (editingProject) {
        // The edit dialog only manages core fields + technologyNames.
        // Pass null for unedited collections so backend PRESERVES them (not clears).
        const updatePayload: ProjectUpdateInput = {
          title: projectForm.title,
          shortDescription: projectForm.shortDescription,
          description: projectForm.description,
          role: projectForm.role,
          featured: projectForm.featured,
          displayOrder: projectForm.displayOrder,
          technologyNames: techNames,
          metrics: null,       // not managed in this dialog — preserve existing
          endpoints: null,     // not managed in this dialog — preserve existing
          architectureLayers: null, // not managed in this dialog — preserve existing
        };
        await updateProject(editingProject.id, updatePayload);
      } else {
        await createProject(payload);
      }
      await reloadProjects();
      setProjectDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save project.';
      if (msg.toLowerCase().includes('unauthorized')) handleUnauthorized();
      setProjectError(msg);
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const ok = window.confirm(isRTL ? 'هل أنت متأكد من حذف المشروع؟' : 'Delete this project?');
    if (!ok) return;
    try {
      await deleteProject(id);
      await reloadProjects();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project.';
      if (msg.toLowerCase().includes('unauthorized')) handleUnauthorized();
      setProjectError(msg);
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
                    placeholder="••••••••••••"
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
                onClick={handleLogout}
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

          {/* Inquiries Tab */}
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

          {/* Media & Avatar Tab */}
          {activeTab === 'media' && <AdminImageManager />}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-theme-text">
                    {isRTL ? 'مشاريع المنظومة الحقيقية' : 'Live Production Projects'}
                  </h2>
                  <p className="text-xs text-theme-muted">
                    {projects.length} {isRTL ? 'مشروع مسجل في الخادم' : 'projects loaded from ASP.NET Core backend'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openCreateDialog}
                    className="btn-primary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'إضافة مشروع جديد' : 'Create Project'}</span>
                  </button>
                </div>
              </div>

              {projectsLoading && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="card p-6 animate-pulse h-40 bg-theme-card" />
                  ))}
                </div>
              )}

              {projectsError && (
                <p className="text-sm text-amber-400">
                  {isRTL ? 'تعذر جلب المشاريع من الخادم مباشرة:' : 'Notice:'} {projectsError}
                </p>
              )}

              {!projectsLoading && projects.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="card p-5 bg-theme-card border border-theme-border rounded-xl shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-theme-text">{project.title}</h3>
                            {project.featured && (
                              <span className="badge badge-accent text-[10px]">
                                {isRTL ? 'مميز' : 'Featured'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-theme-muted mt-0.5">slug: {project.slug}</p>
                        </div>

                        <a
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost p-1 text-theme-muted hover:text-theme-accent"
                          title="View Project Detail"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <p className="text-xs text-theme-text-sec line-clamp-2 leading-relaxed">
                        {project.shortDescription}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] bg-theme-bg-sec border border-theme-border text-theme-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-theme-border text-xs text-theme-muted">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Layers className="w-3.5 h-3.5 text-theme-accent" />
                          <span>{project.apiEndpoints?.length || 0} APIs</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditDialog(project)}
                            className="btn-ghost p-1.5 text-xs hover:text-theme-accent"
                            title={isRTL ? 'تعديل' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                            className="btn-ghost p-1.5 text-xs text-red-400 hover:text-red-300"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="card p-12 text-center bg-theme-card border border-theme-border">
              <BarChart3 className="w-8 h-8 text-theme-muted mx-auto mb-2" />
              <p className="text-sm text-theme-muted">
                {isRTL
                  ? 'مؤشرات الأداء وتحليلات الزيارات للأنظمة والمشاريع متصلة بنقاط النهاية الحقيقية.'
                  : 'Real-time telemetry and API invocation monitoring.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Create/Edit Dialog */}
      {projectDialogOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 w-full max-w-2xl bg-theme-card border border-theme-border rounded-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-theme-text">
                {editingProject
                  ? (isRTL ? 'تعديل المشروع' : 'Edit Project')
                  : (isRTL ? 'مشروع جديد' : 'New Project')}
              </h2>
              <button
                type="button"
                onClick={() => setProjectDialogOpen(false)}
                className="btn-ghost p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pe-2">
              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Title</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Slug</label>
                <input
                  type="text"
                  value={projectForm.slug}
                  onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                  className="input-field text-sm"
                  disabled={!!editingProject}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Short Description</label>
                <input
                  type="text"
                  value={projectForm.shortDescription}
                  onChange={(e) => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="input-field text-sm"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Role</label>
                  <input
                    type="text"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">Display Order</label>
                  <input
                    type="number"
                    value={projectForm.displayOrder}
                    onChange={(e) => setProjectForm({ ...projectForm, displayOrder: Number(e.target.value) || 0 })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1">
                  Technology Names (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder=".NET 8, EF Core, SQL Server"
                  className="input-field text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                />
                <label htmlFor="featured-check" className="text-xs font-semibold text-theme-text">
                  Featured
                </label>
              </div>

              {projectError && <p className="text-xs text-red-400 font-medium">{projectError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-theme-border">
              <button
                type="button"
                onClick={() => setProjectDialogOpen(false)}
                className="btn-ghost text-xs"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={savingProject || !projectForm.title || !projectForm.slug}
                className="btn-primary text-xs"
              >
                {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>
                  {savingProject
                    ? (isRTL ? 'جاري الحفظ' : 'Saving...')
                    : (isRTL ? 'حفظ' : 'Save')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
