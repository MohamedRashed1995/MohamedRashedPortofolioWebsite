import React, { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Star,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Sliders,
  Code2,
  Sparkles,
  Database,
  Key,
  FileText,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { AdminImageManager } from '@/components/AdminImageManager';
import ProjectImage from '@/components/ProjectImage';
import {
  verifyAdminPassword,
  verifyAdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS,
  setCustomAdminPassword,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '@/services/dataStorage';
import type { Project } from '@/types';


// Preset project banner images for quick selection
const PRESET_PROJECT_IMAGES = [
  {
    label: 'DentZone Medical Clinic',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Adros Core LMS Platform',
    url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Real-Time Helpdesk SignalR',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI Evaluation & RLHF Lab',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cloud & Microservices Infrastructure',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Clean Architecture .NET 8 Backend',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
];

type AdminTab = 'overview' | 'projects' | 'personal' | 'skills' | 'inquiries' | 'media' | 'cloud';

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const {
    projects,
    siteContent,
    techStack,
    inquiries,
    addProject,
    updateProject,
    deleteProject,
    resetProjects,
    updateSiteContent,
    resetSiteContent,
    addOrUpdateSkill,
    deleteSkill,
    resetTechStack,
    updateInquiryStatus,
    deleteInquiry,
    exportBackup,
    importBackup,
    resetAllData,
  } = useData();


  // Authentication State
  const [authed, setAuthed] = useState<boolean>(() => isAdminAuthenticated());
  const [emailInput, setEmailInput] = useState(DEFAULT_ADMIN_CREDENTIALS.email);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Password Management
  const [newPassword, setNewPassword] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState(false);

  // Project Editor Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '',
    titleAr: '',
    slug: '',
    shortDescription: '',
    shortDescriptionAr: '',
    longDescription: '',
    longDescriptionAr: '',
    role: 'Lead Full-Stack .NET Engineer',
    roleAr: 'مهندس برمجيات رئيسي .NET',
    period: '2024',
    featured: true,
    tags: ['.NET 8', 'Clean Architecture', 'C#', 'EF Core', 'SQL Server'],
    image: PRESET_PROJECT_IMAGES[0].url,
    repoUrl: 'https://github.com/MohamedRashed1995',
    liveUrl: '',
    thumbnailColor: 'from-blue-600 to-indigo-700',
    keyFeatures: [
      {
        title: 'Clean Architecture with DDD',
        titleAr: 'المعمارية النظيفة والتصميم الموجه بالنطاق',
        description: 'Decoupled domain rules with MediatR CQRS pattern.',
        descriptionAr: 'فصل تام لمنطق الأعمال مع تطبيق نمط CQRS و MediatR.',
      },
    ],
    layers: [
      {
        name: 'Domain',
        description: 'Core entities, value objects, and domain exceptions.',
        descriptionAr: 'الكيانات الأساسية، كائنات القيمة، واستثناءات النطاق.',
        responsibilities: ['Zero external dependencies', 'Pure business logic'],
        responsibilitiesAr: ['خالية تماماً من التبعيات الخارجية', 'منطق الأعمال الصافي'],
      },
      {
        name: 'Application',
        description: 'CQRS Commands, Queries, Validators, and DTOs.',
        descriptionAr: 'أوامر واستعلامات CQRS، المحققات، وكائنات نقل البيانات.',
        responsibilities: ['MediatR Handlers', 'FluentValidation'],
        responsibilitiesAr: ['معالجات MediatR', 'التحقق باستخدام FluentValidation'],
      },
      {
        name: 'Infrastructure',
        description: 'EF Core DbContext, Repositories, JWT, External APIs.',
        descriptionAr: 'سياق قاعدة بيانات EF Core، المستودعات، والخدمات الخارجية.',
        responsibilities: ['SQL Server Migrations', 'Email & Storage Services'],
        responsibilitiesAr: ['ترحيل قواعد البيانات SQL', 'خدمات البريد والتخزين'],
      },
      {
        name: 'WebApi',
        description: 'RESTful Controllers, Swagger, Auth Middleware.',
        descriptionAr: 'وحدات التحكم RESTful، توثيق Swagger، وبرمجيات المصادقة.',
        responsibilities: ['API Versioning', 'Rate Limiting & Exception Handling'],
        responsibilitiesAr: ['إصدارات الـ API', 'تحديد معدل الطلبات ومعالجة الأخطاء'],
      },
    ],
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/v1/items',
        description: 'Fetch paginated items with filter criteria',
        sampleResponse: {
          success: true,
          data: [{ id: 1, name: 'Sample Item', status: 'Active' }],
          totalCount: 1,
        },
      },
    ],
  });

  const [tagInput, setTagInput] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState(siteContent);
  useEffect(() => {
    setPersonalForm(siteContent);
  }, [siteContent]);

  // Skill Editor Modal
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<number>(85);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedCategoryForSkill, setSelectedCategoryForSkill] = useState<string>('Backend & Architecture');


  // Inquiries Search & Filter
  const [inquiryFilter, setInquiryFilter] = useState<'All' | 'New' | 'Read' | 'Archived'>('All');
  const [inquirySearch, setInquirySearch] = useState('');

  // Backup file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Handle Login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      if (verifyAdminCredentials(emailInput, passwordInput) || verifyAdminPassword(passwordInput)) {
        setAdminAuthenticated(true);
        setAuthed(true);
        setPasswordInput('');
        showToast(
          isRTL
            ? `مرحباً بك يا م. محمد راشد (${emailInput || DEFAULT_ADMIN_CREDENTIALS.email})`
            : `Welcome back, Admin (${emailInput || DEFAULT_ADMIN_CREDENTIALS.email})!`
        );
      } else {
        setAuthError(
          isRTL
            ? 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور (Password@123).'
            : 'Invalid credentials. Please verify your email and password (Password@123).'
        );
      }
      setAuthLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setAuthed(false);
    showToast(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast(isRTL ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' : 'Password must be at least 4 characters', 'error');
      return;
    }
    setCustomAdminPassword(newPassword);
    setChangePassSuccess(true);
    setNewPassword('');
    showToast(isRTL ? 'تم تحديث كلمة المرور الخاصة بالمسؤول بنجاح' : 'Admin password updated successfully');
    setTimeout(() => setChangePassSuccess(false), 4000);
  };

  // Open Project Form for Create
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      id: `proj-${Date.now()}`,
      title: '',
      titleAr: '',
      slug: '',
      shortDescription: '',
      shortDescriptionAr: '',
      longDescription: '',
      longDescriptionAr: '',
      role: 'Lead Full-Stack .NET Engineer',
      roleAr: 'مهندس برمجيات رئيسي .NET',
      period: '2024',
      featured: true,
      tags: ['.NET 8', 'Clean Architecture', 'C#', 'EF Core', 'SQL Server'],
      image: PRESET_PROJECT_IMAGES[0].url,
      repoUrl: 'https://github.com/MohamedRashed1995',
      liveUrl: '',
      thumbnailColor: 'from-blue-600 to-indigo-700',
      keyFeatures: [
        {
          title: 'Clean Architecture with DDD',
          titleAr: 'المعمارية النظيفة والتصميم الموجه بالنطاق',
          description: 'Decoupled domain rules with MediatR CQRS pattern.',
          descriptionAr: 'فصل تام لمنطق الأعمال مع تطبيق نمط CQRS و MediatR.',
        },
      ],
      layers: [
        {
          name: 'Domain',
          description: 'Core entities, value objects, and domain exceptions.',
          descriptionAr: 'الكيانات الأساسية، كائنات القيمة، واستثناءات النطاق.',
          responsibilities: ['Zero external dependencies', 'Pure business logic'],
          responsibilitiesAr: ['خالية تماماً من التبعيات الخارجية', 'منطق الأعمال الصافي'],
        },
        {
          name: 'Application',
          description: 'CQRS Commands, Queries, Validators, and DTOs.',
          descriptionAr: 'أوامر واستعلامات CQRS، المحققات، وكائنات نقل البيانات.',
          responsibilities: ['MediatR Handlers', 'FluentValidation'],
          responsibilitiesAr: ['معالجات MediatR', 'التحقق باستخدام FluentValidation'],
        },
        {
          name: 'Infrastructure',
          description: 'EF Core DbContext, Repositories, JWT, External APIs.',
          descriptionAr: 'سياق قاعدة بيانات EF Core، المستودعات، والخدمات الخارجية.',
          responsibilities: ['SQL Server Migrations', 'Email & Storage Services'],
          responsibilitiesAr: ['ترحيل قواعد البيانات SQL', 'خدمات البريد والتخزين'],
        },
        {
          name: 'WebApi',
          description: 'RESTful Controllers, Swagger, Auth Middleware.',
          descriptionAr: 'وحدات التحكم RESTful، توثيق Swagger، وبرمجيات المصادقة.',
          responsibilities: ['API Versioning', 'Rate Limiting & Exception Handling'],
          responsibilitiesAr: ['إصدارات الـ API', 'تحديد معدل الطلبات ومعالجة الأخطاء'],
        },
      ],
      apiEndpoints: [
        {
          method: 'GET',
          path: '/api/v1/items',
          description: 'Fetch paginated items with filter criteria',
          sampleResponse: {
            success: true,
            data: [{ id: 1, name: 'Sample Item', status: 'Active' }],
            totalCount: 1,
          },
        },
      ],
    });
    setIsProjectModalOpen(true);
  };

  // Open Project Form for Edit
  const handleOpenEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectForm({ ...project });
    setIsProjectModalOpen(true);
  };

  // Save Project (Create or Update)
  const handleSaveProject = (e: FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.shortDescription) {
      showToast(isRTL ? 'يرجى إدخال اسم المشروع والوصف المختصر' : 'Please provide project title and short description', 'error');
      return;
    }

    const slug =
      projectForm.slug?.trim() ||
      projectForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const finalProject: Project = {
      ...(projectForm as Project),
      id: editingProjectId || projectForm.id || `proj-${Date.now()}`,
      slug,
      tags: projectForm.tags && projectForm.tags.length > 0 ? projectForm.tags : ['.NET 8', 'C#'],
      thumbnailColor: projectForm.thumbnailColor || 'from-blue-600 to-indigo-700',
      layers: projectForm.layers || [],
      apiEndpoints: projectForm.apiEndpoints || [],
      keyFeatures: projectForm.keyFeatures || [],
      featured: Boolean(projectForm.featured),
      role: projectForm.role || 'Full-Stack .NET Engineer',
      period: projectForm.period || '2024',
    };

    if (editingProjectId) {
      updateProject(editingProjectId, finalProject);
      showToast(isRTL ? `تم تحديث المشروع "${finalProject.title}" بنجاح` : `Project "${finalProject.title}" updated successfully`);
    } else {
      addProject(finalProject);
      showToast(isRTL ? `تمت إضافة المشروع الجديد "${finalProject.title}" بنجاح` : `Project "${finalProject.title}" created successfully`);
    }

    setIsProjectModalOpen(false);
  };

  // Delete Project with prompt
  const handleDeleteProject = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: isRTL ? 'حذف المشروع' : 'Delete Project',
      message: isRTL
        ? `هل أنت متأكد من رغبتك في حذف المشروع "${title}" نهائياً من الموقع؟`
        : `Are you sure you want to permanently delete "${title}"?`,
      onConfirm: () => {
        deleteProject(id);
        showToast(isRTL ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Duplicate Project
  const handleDuplicateProject = (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      slug: `${project.slug}-copy`,
      title: `${project.title} (Copy)`,
      titleAr: project.titleAr ? `${project.titleAr} (نسخة)` : undefined,
    };
    addProject(duplicated);
    showToast(isRTL ? 'تم نسخ المشروع بنجاح' : 'Project duplicated successfully');
  };

  // Tag helper for Project Form
  const handleAddTag = () => {
    if (tagInput.trim() && !projectForm.tags?.includes(tagInput.trim())) {
      setProjectForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProjectForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove) || [],
    }));
  };

  // Save Personal Info
  const handleSavePersonalInfo = (e: FormEvent) => {
    e.preventDefault();
    updateSiteContent(personalForm);
    showToast(isRTL ? 'تم حفظ وتحديث المعلومات الشخصية بنجاح!' : 'Personal information and site content saved!');
  };

  // Add Key Feature item helper
  const handleAddKeyFeature = () => {
    setProjectForm((prev) => ({
      ...prev,
      keyFeatures: [
        ...(prev.keyFeatures || []),
        {
          title: 'New Key Feature',
          titleAr: 'ميزة جديدة',
          description: 'Description of the feature',
          descriptionAr: 'تفاصيل الميزة',
        },
      ],
    }));
  };

  // Add API Endpoint helper
  const handleAddApiEndpoint = () => {
    setProjectForm((prev) => ({
      ...prev,
      apiEndpoints: [
        ...(prev.apiEndpoints || []),
        {
          method: 'GET',
          path: '/api/v1/resource',
          description: 'Endpoint summary description',
          sampleResponse: { status: 'success', timestamp: new Date().toISOString() },
        },
      ],
    }));
  };

  // Add Skill
  const handleSaveNewSkill = (e: FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      showToast(isRTL ? 'يرجى إدخال اسم المهارة' : 'Please enter a skill name', 'error');
      return;
    }
    addOrUpdateSkill(selectedCategoryForSkill, newSkillName.trim(), newSkillProficiency);
    showToast(isRTL ? `تمت إضافة مهارة "${newSkillName}" بنجاح` : `Skill "${newSkillName}" added successfully`);
    setNewSkillName('');
    setIsSkillModalOpen(false);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(isRTL ? 'تم تصدير ملف النسخة الاحتياطية بنجاح' : 'Backup JSON exported successfully');
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importBackup(content);
        if (success) {
          showToast(isRTL ? 'تم استيراد واستعادة البيانات بنجاح' : 'Data restored successfully from backup');
        } else {
          showToast(isRTL ? 'فشل استيراد الملف: تنسيق JSON غير صالح' : 'Failed to import: invalid JSON format', 'error');
        }
      } catch {
        showToast(isRTL ? 'حدث خطأ أثناء قراءة الملف' : 'Error reading backup file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to Factory Defaults
  const handleFactoryReset = () => {
    setConfirmModal({
      isOpen: true,
      title: isRTL ? 'استعادة إعدادات المصنع والبيانات الافتراضية' : 'Factory Reset Data',
      message: isRTL
        ? 'هل أنت متأكد من رغبتك في مسح كافة التعديلات واستعادة المشاريع والمهارات والمحتوى الافتراضي الأصلي؟'
        : 'Are you sure you want to reset all projects, skills, and site content back to original seed defaults?',
      onConfirm: () => {
        resetAllData();
        showToast(isRTL ? 'تمت استعادة البيانات الافتراضية بنجاح' : 'All data reset to initial defaults');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.titleAr && p.titleAr.toLowerCase().includes(projectSearch.toLowerCase())) ||
        p.tags.some((t) => t.toLowerCase().includes(projectSearch.toLowerCase()))
    );
  }, [projects, projectSearch]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchFilter = inquiryFilter === 'All' || inq.status === inquiryFilter;
      const matchSearch =
        inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.message.toLowerCase().includes(inquirySearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [inquiries, inquiryFilter, inquirySearch]);

  // Total Skills Count
  const totalSkillsCount = useMemo(() => {
    return techStack.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [techStack]);

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter((i) => i.status === 'New').length;
  }, [inquiries]);

  // ----------------------------------------------------
  // UNPROTECTED LOGIN SCREEN
  // ----------------------------------------------------
  if (!authed) {
    return (
      <PageTransition title="Admin Login — Mohamed Rashed Abdelazim">
        <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="card p-6 sm:p-8 w-full max-w-md bg-theme-card border border-theme-border shadow-2xl relative overflow-hidden"
          >
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-accent/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-theme-accent-light border border-theme-border flex items-center justify-center shadow-inner">
                <Lock className="w-6 h-6 text-theme-accent" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-theme-text">
                  {isRTL ? 'لوحة تحكم المسؤول الآمنة' : 'Admin Security Access'}
                </h1>
                <p className="text-xs text-theme-muted mt-0.5">
                  {isRTL
                    ? 'أدخل كلمة المرور المخصصة لفتح إدارة الموقع والمشاريع'
                    : 'Enter admin master password to manage projects and site content'}
                </p>
              </div>
            </div>

            {/* Quick Credentials Helpers */}
            <div className="mb-5 p-3 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-xs space-y-2 text-theme-text">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                  <span className="font-semibold text-theme-text">
                    {isRTL ? 'حساب المسؤول المعتمد:' : 'Primary Admin Account:'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(DEFAULT_ADMIN_CREDENTIALS.email);
                    setPasswordInput(DEFAULT_ADMIN_CREDENTIALS.password);
                    setAuthError(null);
                  }}
                  className="text-[11px] font-bold text-theme-accent hover:underline bg-theme-card px-2 py-0.5 rounded border border-theme-accent/30"
                >
                  {isRTL ? 'تعبئة الحساب' : 'Autofill Admin'}
                </button>
              </div>
              <div className="font-mono text-[11px] text-theme-muted flex flex-col gap-0.5 ps-5">
                <span>Email: <strong className="text-theme-text">{DEFAULT_ADMIN_CREDENTIALS.email}</strong></span>
                <span>Pass: <strong className="text-theme-text">{DEFAULT_ADMIN_CREDENTIALS.password}</strong></span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email-input"
                  className="block text-xs font-semibold text-theme-text mb-1.5"
                >
                  {isRTL ? 'البريد الإلكتروني للمسؤول' : 'Admin Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    id="admin-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="input-field ps-10 pe-3 text-xs sm:text-sm font-mono"
                    placeholder="mrashed19951995@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-semibold text-theme-text mb-1.5"
                >
                  {isRTL ? 'كلمة مرور لوحة التحكم' : 'Master Admin Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="input-field ps-10 pe-10 text-sm font-mono"
                    placeholder="••••••••"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={authLoading || !passwordInput}
                className="btn-primary w-full justify-center py-2.5 shadow-lg"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {authLoading
                    ? isRTL
                      ? 'جاري التحقق...'
                      : 'Authenticating...'
                    : isRTL
                    ? 'فتح لوحة التحكم'
                    : 'Access Dashboard'}
                </span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-theme-muted hover:text-theme-text inline-flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>{isRTL ? 'الرجوع إلى الصفحة الرئيسية للموقع' : 'Back to Public Site'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ----------------------------------------------------
  // PROTECTED ADMIN DASHBOARD
  // ----------------------------------------------------
  const tabsList: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
    { id: 'projects', label: isRTL ? 'إدارة المشاريع' : 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'personal', label: isRTL ? 'المعلومات الشخصية' : 'Personal Info', icon: User },
    { id: 'skills', label: isRTL ? 'المهارات والتقنيات' : 'Skills & Tech', icon: Code2, badge: totalSkillsCount },
    { id: 'inquiries', label: isRTL ? 'الاستفسارات' : 'Inquiries', icon: Inbox, badge: newInquiriesCount },
    { id: 'media', label: isRTL ? 'الصور والوسائط' : 'Media & Avatar', icon: ImageIcon },
    { id: 'cloud', label: isRTL ? 'النسخ وقاعدة البيانات' : 'Cloud & Backup', icon: Database },
  ];

  return (
    <PageTransition title="Admin Dashboard — Mohamed Rashed Abdelazim">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-20 ${
              isRTL ? 'left-6' : 'right-6'
            } z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : 'bg-red-500/90 text-white border-red-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-accent text-[11px] px-2.5 py-0.5 font-mono">
                  ADMIN v2.0 • LIVE SYNC
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text mt-1">
                {isRTL ? 'لوحة التحكم الإدارية المتكاملة' : 'Central Admin Management Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                {isRTL
                  ? 'إدارة متكاملة للمشاريع، السيرة الذاتية، المهارات، والرسائل المستلمة في الوقت الحقيقي.'
                  : 'Manage projects, site content, skills matrix, and client inquiries with instant reactivity.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isRTL ? 'معاينة الموقع' : 'View Live Site'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="btn-ghost text-xs flex items-center gap-1.5"
                title={isRTL ? 'تصدير نسخة احتياطية' : 'Export JSON Backup'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRTL ? 'نسخ احتياطي' : 'Export'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-theme-border">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-theme-accent text-white shadow-md'
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-hover bg-theme-bg-sec/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-theme-accent-light text-theme-accent border border-theme-border'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ---------------------------------------------------- */}
          {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 bg-theme-card border border-theme-border shadow-sm">
                  <div className="flex items-center justify-between text-theme-muted mb-2">
                    <span className="text-xs font-semibold">{isRTL ? 'إجمالي المشاريع' : 'Total Projects'}</span>
                    <FolderKanban className="w-4 h-4 text-theme-accent" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-theme-text font-mono">
                    {projects.length}
                  </p>
                  <p className="text-[11px] text-theme-muted mt-1">
                    {projects.filter((p) => p.featured).length} {isRTL ? 'مشروع مميز في الواجهة' : 'featured on home'}
                  </p>
                </div>

                <div className="card p-5 bg-theme-card border border-theme-border shadow-sm">
                  <div className="flex items-center justify-between text-theme-muted mb-2">
                    <span className="text-xs font-semibold">{isRTL ? 'الرسائل والاستفسارات' : 'Inquiries'}</span>
                    <Inbox className="w-4 h-4 text-theme-accent" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-theme-text font-mono">
                    {inquiries.length}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    {newInquiriesCount} {isRTL ? 'استفسار جديد بانتظار الرد' : 'unread pending'}
                  </p>
                </div>

                <div className="card p-5 bg-theme-card border border-theme-border shadow-sm">
                  <div className="flex items-center justify-between text-theme-muted mb-2">
                    <span className="text-xs font-semibold">{isRTL ? 'المهارات المسجلة' : 'Published Skills'}</span>
                    <Code2 className="w-4 h-4 text-theme-accent" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-theme-text font-mono">
                    {totalSkillsCount}
                  </p>
                  <p className="text-[11px] text-theme-muted mt-1">
                    {techStack.length} {isRTL ? 'تصنيفات رئيسية' : 'skill categories'}
                  </p>
                </div>

                <div className="card p-5 bg-theme-card border border-theme-border shadow-sm">
                  <div className="flex items-center justify-between text-theme-muted mb-2">
                    <span className="text-xs font-semibold">{isRTL ? 'حالة التخزين' : 'Storage Engine'}</span>
                    <Database className="w-4 h-4 text-theme-accent" />
                  </div>
                  <p className="text-lg font-bold text-emerald-400 font-mono">
                    ONLINE (Reactive)
                  </p>
                  <p className="text-[11px] text-theme-muted mt-1">
                    LocalStorage + Cloud Sync
                  </p>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="card p-6 bg-theme-card border border-theme-border shadow-sm">
                <h3 className="text-sm font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-theme-accent" />
                  <span>{isRTL ? 'إجراءات سريعة واختصارات الإدارة' : 'Quick Admin Actions'}</span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCreateProject}
                    className="p-3.5 rounded-xl border border-theme-border bg-theme-bg-sec/50 hover:border-theme-accent hover:bg-theme-hover transition text-start flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-light flex items-center justify-center text-theme-accent">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-accent">
                        {isRTL ? 'إضافة مشروع جديد' : 'Add New Project'}
                      </h4>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL ? 'رفع كود ومعاينة ونقاط API' : 'Create case study & API'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="p-3.5 rounded-xl border border-theme-border bg-theme-bg-sec/50 hover:border-theme-accent hover:bg-theme-hover transition text-start flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-light flex items-center justify-center text-theme-accent">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-accent">
                        {isRTL ? 'تعديل النص والسيرة' : 'Edit Bio & Hero'}
                      </h4>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL ? 'النص الترحيبي ورابط الـ CV' : 'Update resume & job title'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryForSkill('Backend & Architecture');
                      setIsSkillModalOpen(true);
                    }}
                    className="p-3.5 rounded-xl border border-theme-border bg-theme-bg-sec/50 hover:border-theme-accent hover:bg-theme-hover transition text-start flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-light flex items-center justify-center text-theme-accent">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-accent">
                        {isRTL ? 'إضافة مهارة جديدة' : 'Add New Skill'}
                      </h4>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL ? 'تحديد نسبة الإتقان والتقنية' : 'Update technical matrix'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className="p-3.5 rounded-xl border border-theme-border bg-theme-bg-sec/50 hover:border-theme-accent hover:bg-theme-hover transition text-start flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-light flex items-center justify-center text-theme-accent">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-accent">
                        {isRTL ? 'تحديث الصورة الشخصية' : 'Change Avatar'}
                      </h4>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL ? 'رفع وضبط صورة الهيرو' : 'Upload custom profile image'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Quick Overview */}
              <div className="card p-6 bg-theme-card border border-theme-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-theme-accent" />
                    <span>{isRTL ? 'أحدث استفسارات التواصل' : 'Recent Inquiries'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs text-theme-accent font-semibold hover:underline"
                  >
                    {isRTL ? 'عرض جميع الاستفسارات' : 'View all'}
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-theme-muted py-6 text-center">
                    {isRTL ? 'لا توجد استفسارات مسجلة حالياً.' : 'No inquiries recorded yet.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.slice(0, 3).map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3 rounded-lg bg-theme-bg-sec/40 border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-theme-text">{inq.name}</span>
                            <span className="text-[11px] text-theme-muted font-mono">{inq.email}</span>
                            <span className="badge badge-accent text-[10px]">{inq.inquiryType}</span>
                          </div>
                          <p className="text-xs text-theme-text-sec mt-1 line-clamp-1">
                            {inq.message}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full self-start sm:self-auto ${
                            inq.status === 'New'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-theme-bg text-theme-muted border border-theme-border'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 2: PROJECTS MANAGEMENT */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Projects Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-theme-card border border-theme-border shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder={isRTL ? 'البحث في المشاريع بالاسم أو التقنية...' : 'Search projects by name or tech...'}
                    className="input-field text-xs py-2 w-full sm:w-72"
                  />
                  <span className="text-xs text-theme-muted font-mono whitespace-nowrap">
                    {filteredProjects.length} {isRTL ? 'مشروع' : 'projects'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenCreateProject}
                    className="btn-primary text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة مشروع جديد' : 'Add New Project'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: isRTL ? 'استعادة المشاريع الافتراضية' : 'Reset Projects',
                        message: isRTL
                          ? 'هل تريد استعادة قائمة المشاريع الافتراضية؟'
                          : 'Restore initial seed projects?',
                        onConfirm: () => {
                          resetProjects();
                          showToast(isRTL ? 'تمت استعادة المشاريع الافتراضية' : 'Seed projects restored');
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }}
                    className="btn-ghost text-xs"
                    title={isRTL ? 'استعادة المشاريع الافتراضية' : 'Reset Projects'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Projects Grid List */}
              {filteredProjects.length === 0 ? (
                <div className="card p-12 text-center bg-theme-card border border-theme-border">
                  <FolderKanban className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                  <p className="text-sm text-theme-text font-bold">
                    {isRTL ? 'لم يتم العثور على مشاريع تطابق البحث' : 'No projects match your search.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateProject}
                    className="mt-4 btn-primary text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة أول مشروع' : 'Create First Project'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="card rounded-2xl bg-theme-card border border-theme-border shadow-sm hover:border-theme-accent/50 transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Project Thumbnail Header */}
                        <div className="relative h-40 bg-slate-950 overflow-hidden border-b border-theme-border">
                          <ProjectImage
                            src={proj.image}
                            alt={proj.title}
                            title={proj.title}
                            titleAr={proj.titleAr}
                            slug={proj.slug}
                            tags={proj.tags}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            aspectRatio="auto"
                          />
                          {proj.featured && (
                            <span className="absolute top-2.5 end-2.5 badge badge-accent text-[10px] shadow-md flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{isRTL ? 'مميز' : 'Featured'}</span>
                            </span>
                          )}
                        </div>

                        {/* Project Details */}
                        <div className="p-4 sm:p-5 space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-theme-muted font-mono">
                              <span>{proj.period}</span>
                              <span>{proj.slug}</span>
                            </div>
                            <h3 className="text-base font-bold text-theme-text mt-1">
                              {isRTL && proj.titleAr ? proj.titleAr : proj.title}
                            </h3>
                            <p className="text-xs text-theme-text-sec mt-1 line-clamp-2 leading-relaxed">
                              {isRTL && proj.shortDescriptionAr
                                ? proj.shortDescriptionAr
                                : proj.shortDescription}
                            </p>
                          </div>

                          {/* Tags Chips */}
                          <div className="flex flex-wrap gap-1">
                            {proj.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="badge badge-accent text-[10px]">
                                {tag}
                              </span>
                            ))}
                            {proj.tags.length > 4 && (
                              <span className="text-[10px] text-theme-muted font-mono self-center">
                                +{proj.tags.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 border-t border-theme-border bg-theme-bg-sec/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/projects/${proj.slug || proj.id}`)}
                            className="btn-ghost text-xs px-2.5 py-1"
                            title={isRTL ? 'معاينة المشروع' : 'Preview Case Study'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-ghost text-xs px-2 py-1 text-theme-muted hover:text-theme-accent"
                              title={isRTL ? 'رابط المعاينة المباشرة' : 'Live Preview'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-ghost text-xs px-2 py-1 text-theme-muted hover:text-theme-accent"
                              title={isRTL ? 'مستودع GitHub' : 'GitHub Repo'}
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateProject(proj)}
                            className="btn-ghost text-xs px-2 py-1 text-theme-muted hover:text-theme-text"
                            title={isRTL ? 'تكرار المشروع' : 'Duplicate'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(proj)}
                            className="btn-ghost text-xs px-2.5 py-1 text-theme-accent hover:bg-theme-accent/10"
                            title={isRTL ? 'تعديل المشروع' : 'Edit Project'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="ms-1 text-[11px] font-semibold">
                              {isRTL ? 'تعديل' : 'Edit'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                            className="btn-ghost text-xs px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title={isRTL ? 'حذف المشروع' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 3: PERSONAL INFO & HERO CONTENT */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'personal' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                {/* Hero Section Content */}
                <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-theme-border pb-3">
                    <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-theme-accent" />
                      <span>{isRTL ? 'محتوى الواجهة الرئيسية (Hero Section)' : 'Hero & Header Content'}</span>
                    </h3>
                    <span className="text-xs text-theme-muted">
                      {isRTL ? 'يدعم اللغتين الإنجليزية والعربية' : 'Supports English & Arabic'}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الاسم الكامل (English)' : 'Full Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الاسم الكامل (بالعربي)' : 'Full Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.nameAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, nameAr: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'المسمى الوظيفي الرئيسي (English)' : 'Title / Role (English)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.titleRole}
                        onChange={(e) => setPersonalForm({ ...personalForm, titleRole: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'المسمى الوظيفي (بالعربي)' : 'Title / Role (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.titleRoleAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, titleRoleAr: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'شارة الهيرو العلوية (Hero Badge - EN)' : 'Hero Badge (English)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.heroBadge}
                        onChange={(e) => setPersonalForm({ ...personalForm, heroBadge: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'شارة الهيرو العلوية (بالعربي)' : 'Hero Badge (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.heroBadgeAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, heroBadgeAr: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'النص الترحيبي والوصف (Subtitle - EN)' : 'Hero Subtitle (English)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.heroSubtitle}
                        onChange={(e) => setPersonalForm({ ...personalForm, heroSubtitle: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'النص الترحيبي والوصف (بالعربي)' : 'Hero Subtitle (Arabic)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.heroSubtitleAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, heroSubtitleAr: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                      />
                    </div>
                  </div>

                  {/* CV Download / File configuration */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-theme-border">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'اسم ملف السيرة الذاتية (CV File Name)' : 'CV File Name'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.cvFileName || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, cvFileName: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 font-mono"
                        placeholder="Mohamed_Rashed_CV.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'رابط ملف الـ CV (URL)' : 'CV Download URL'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.cvUrl || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, cvUrl: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 font-mono"
                        placeholder="/Mohamed_Rashed_CV.pdf"
                      />
                    </div>
                  </div>
                </div>

                {/* Stat Counters Config */}
                <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                    <BarChart3 className="w-4 h-4 text-theme-accent" />
                    <span>{isRTL ? 'عدادات المقاييس والإحصائيات (Hero Stats)' : 'Key Metric Highlights'}</span>
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2">
                      <label className="block text-xs font-bold text-theme-accent">
                        {isRTL ? 'سنوات الخبرة' : 'Years Experience'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.statsExperience}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsExperience: e.target.value })}
                        className="input-field text-xs py-1.5 font-mono"
                      />
                      <input
                        type="text"
                        value={personalForm.statsExperienceLabel}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsExperienceLabel: e.target.value })}
                        placeholder="Label (EN)"
                        className="input-field text-[11px] py-1"
                      />
                      <input
                        type="text"
                        value={personalForm.statsExperienceLabelAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsExperienceLabelAr: e.target.value })}
                        placeholder="التسمية (عربي)"
                        className="input-field text-[11px] py-1 text-right"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2">
                      <label className="block text-xs font-bold text-theme-accent">
                        {isRTL ? 'عدد المشاريع' : 'Projects Count'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.statsProjects}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsProjects: e.target.value })}
                        className="input-field text-xs py-1.5 font-mono"
                      />
                      <input
                        type="text"
                        value={personalForm.statsProjectsLabel}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsProjectsLabel: e.target.value })}
                        placeholder="Label (EN)"
                        className="input-field text-[11px] py-1"
                      />
                      <input
                        type="text"
                        value={personalForm.statsProjectsLabelAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsProjectsLabelAr: e.target.value })}
                        placeholder="التسمية (عربي)"
                        className="input-field text-[11px] py-1 text-right"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2">
                      <label className="block text-xs font-bold text-theme-accent">
                        {isRTL ? 'المعمارية النظيفة' : 'Clean Architecture'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.statsArchitecture}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsArchitecture: e.target.value })}
                        className="input-field text-xs py-1.5 font-mono"
                      />
                      <input
                        type="text"
                        value={personalForm.statsArchitectureLabel}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsArchitectureLabel: e.target.value })}
                        placeholder="Label (EN)"
                        className="input-field text-[11px] py-1"
                      />
                      <input
                        type="text"
                        value={personalForm.statsArchitectureLabelAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsArchitectureLabelAr: e.target.value })}
                        placeholder="التسمية (عربي)"
                        className="input-field text-[11px] py-1 text-right"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2">
                      <label className="block text-xs font-bold text-theme-accent">
                        {isRTL ? 'تقييم كود الذكاء الاصطناعي' : 'AI Evaluations'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.statsAiEvaluations}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsAiEvaluations: e.target.value })}
                        className="input-field text-xs py-1.5 font-mono"
                      />
                      <input
                        type="text"
                        value={personalForm.statsAiEvaluationsLabel}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsAiEvaluationsLabel: e.target.value })}
                        placeholder="Label (EN)"
                        className="input-field text-[11px] py-1"
                      />
                      <input
                        type="text"
                        value={personalForm.statsAiEvaluationsLabelAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, statsAiEvaluationsLabelAr: e.target.value })}
                        placeholder="التسمية (عربي)"
                        className="input-field text-[11px] py-1 text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* About & Bio Narrative Section */}
                <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                    <FileText className="w-4 h-4 text-theme-accent" />
                    <span>{isRTL ? 'نصوص صفحة من أنا (About & Narrative)' : 'About Page Biography'}</span>
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'عنوان النبذة (Bio Heading - EN)' : 'Bio Heading (English)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.bioHeading}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioHeading: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'عنوان النبذة (بالعربي)' : 'Bio Heading (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.bioHeadingAr || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioHeadingAr: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الأولى (Bio Paragraph 1 - EN)' : 'Paragraph 1 (.NET Engineering - EN)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph1}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph1: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الأولى (بالعربي)' : 'Paragraph 1 (Arabic)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph1Ar || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph1Ar: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الثانية (Bio Paragraph 2 - AI Evaluation - EN)' : 'Paragraph 2 (AI Evaluation - EN)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph2}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph2: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الثانية (بالعربي)' : 'Paragraph 2 (Arabic)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph2Ar || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph2Ar: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الثالثة (Bio Paragraph 3 - Clean Architecture - EN)' : 'Paragraph 3 (Clean Architecture - EN)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph3}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph3: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الفقرة الثالثة (بالعربي)' : 'Paragraph 3 (Arabic)'}
                      </label>
                      <textarea
                        rows={3}
                        value={personalForm.bioParagraph3Ar || ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, bioParagraph3Ar: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Contact Coordinates */}
                <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                    <Mail className="w-4 h-4 text-theme-accent" />
                    <span>{isRTL ? 'بيانات التواصل والروابط الاجتماعية' : 'Contact Coordinates & Socials'}</span>
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'البريد الإلكتروني الأساسي' : 'Primary Email'}
                      </label>
                      <input
                        type="email"
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'الموقع الجغرافي (Location)' : 'Location'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.location}
                        onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'حالة التفرغ للعمل (Availability)' : 'Availability Status'}
                      </label>
                      <input
                        type="text"
                        value={personalForm.availability}
                        onChange={(e) => setPersonalForm({ ...personalForm, availability: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'رابط حساب GitHub' : 'GitHub Profile URL'}
                      </label>
                      <input
                        type="url"
                        value={personalForm.githubUrl}
                        onChange={(e) => setPersonalForm({ ...personalForm, githubUrl: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-theme-text mb-1">
                        {isRTL ? 'رابط حساب LinkedIn' : 'LinkedIn Profile URL'}
                      </label>
                      <input
                        type="url"
                        value={personalForm.linkedinUrl}
                        onChange={(e) => setPersonalForm({ ...personalForm, linkedinUrl: e.target.value })}
                        className="input-field text-xs sm:text-sm py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetSiteContent();
                      showToast(isRTL ? 'تمت استعادة المحتوى الافتراضي' : 'Restored default content');
                    }}
                    className="btn-ghost text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'استعادة الافتراضي' : 'Reset to Default'}</span>
                  </button>

                  <button type="submit" className="btn-primary text-xs sm:text-sm px-6 py-2.5 shadow-lg">
                    <Save className="w-4 h-4" />
                    <span>{isRTL ? 'حفظ كافة التعديلات' : 'Save All Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 4: SKILLS & TECH MATRIX */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-theme-card border border-theme-border shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-theme-text">
                    {isRTL ? 'إدارة المهارات والتقنيات المعروضة' : 'Technical Skills & Proficiency Matrix'}
                  </h3>
                  <p className="text-xs text-theme-muted">
                    {isRTL
                      ? 'يمكنك إضافة وتعديل وحذف المهارات وضبط مؤشرات الإتقان بدقة.'
                      : 'Add, update proficiency ratings, and categorize technical tools.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryForSkill(techStack[0]?.category || 'Backend & Architecture');
                      setIsSkillModalOpen(true);
                    }}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة مهارة' : 'Add Skill'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetTechStack();
                      showToast(isRTL ? 'تمت استعادة مصفوفة المهارات الافتراضية' : 'Restored default skills');
                    }}
                    className="btn-ghost text-xs"
                    title={isRTL ? 'استعادة الافتراضي' : 'Reset default'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {techStack.map((category) => (
                  <div
                    key={category.category}
                    className="card p-5 sm:p-6 bg-theme-card border border-theme-border shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-theme-border pb-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-theme-text">
                          {category.category}
                        </h4>
                        <span className="text-[11px] text-theme-muted font-mono">
                          {category.items.length} {isRTL ? 'تقنيات' : 'items'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryForSkill(category.category);
                          setIsSkillModalOpen(true);
                        }}
                        className="btn-ghost text-xs px-2.5 py-1 text-theme-accent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'إضافة' : 'Add'}</span>
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className="p-3 rounded-xl bg-theme-bg-sec/30 border border-theme-border/70 space-y-2 hover:border-theme-accent/40 transition"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-theme-text">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-theme-accent font-bold">
                                {item.proficiency}%
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteSkill(category.category, item.name);
                                  showToast(isRTL ? `تم حذف مهارة "${item.name}"` : `Deleted ${item.name}`);
                                }}
                                className="text-theme-muted hover:text-red-400 p-0.5"
                                title={isRTL ? 'حذف المهارة' : 'Delete skill'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Interactive Range Slider */}
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={item.proficiency}
                              onChange={(e) => {
                                addOrUpdateSkill(category.category, item.name, Number(e.target.value));
                              }}
                              className="w-full h-1.5 bg-theme-bg-sec rounded-lg appearance-none cursor-pointer accent-theme-accent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 5: INQUIRIES & CONTACT MESSAGES */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'inquiries' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-theme-card border border-theme-border shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder={isRTL ? 'البحث في الرسائل والأسماء...' : 'Search inquiries by name or keyword...'}
                    className="input-field text-xs py-2 w-full sm:w-72"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['All', 'New', 'Read', 'Archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setInquiryFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        inquiryFilter === st
                          ? 'bg-theme-accent text-white shadow-sm'
                          : 'bg-theme-bg-sec text-theme-muted hover:text-theme-text'
                      }`}
                    >
                      {st === 'All'
                        ? isRTL
                          ? 'الكل'
                          : 'All'
                        : st === 'New'
                        ? isRTL
                          ? 'جديدة'
                          : 'New'
                        : st === 'Read'
                        ? isRTL
                          ? 'مقروءة'
                          : 'Read'
                        : isRTL
                        ? 'مؤرشفة'
                        : 'Archived'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiries List */}
              {filteredInquiries.length === 0 ? (
                <div className="card p-12 text-center bg-theme-card border border-theme-border">
                  <Inbox className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                  <p className="text-sm text-theme-muted">
                    {isRTL ? 'لا توجد استفسارات مسجلة في هذا القسم.' : 'No contact inquiries found.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="card p-5 bg-theme-card border border-theme-border shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border pb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-sm font-bold text-theme-text">{inq.name}</span>
                            <span className="text-xs text-theme-muted ms-2 font-mono">{inq.email}</span>
                          </div>
                          <span className="badge badge-accent text-[10px]">{inq.inquiryType}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={inq.status}
                            onChange={(e) => {
                              updateInquiryStatus(inq.id, e.target.value as 'New' | 'Read' | 'Archived');
                              showToast(isRTL ? 'تم تحديث حالة الاستفسار' : 'Inquiry status updated');
                            }}
                            className="input-field text-xs py-1 font-mono"
                          >
                            <option value="New">{isRTL ? 'جديد (New)' : 'New'}</option>
                            <option value="Read">{isRTL ? 'تمت المراجعة (Read)' : 'Read'}</option>
                            <option value="Archived">{isRTL ? 'مؤرشف (Archived)' : 'Archived'}</option>
                          </select>

                          <a
                            href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.inquiryType)}`}
                            className="btn-ghost text-xs px-2.5 py-1 text-theme-accent"
                            title={isRTL ? 'الرد عبر البريد' : 'Reply via Email'}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isRTL ? 'رد' : 'Reply'}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              deleteInquiry(inq.id);
                              showToast(isRTL ? 'تم حذف الاستفسار' : 'Inquiry deleted');
                            }}
                            className="btn-ghost text-xs px-2 py-1 text-red-400 hover:bg-red-500/10"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-theme-text-sec leading-relaxed bg-theme-bg-sec/40 p-3.5 rounded-xl border border-theme-border/60">
                        {inq.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-theme-muted font-mono pt-1">
                        <span>ID: {inq.id}</span>
                        <span>{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 6: MEDIA & AVATAR MANAGER */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'media' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AdminImageManager />
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 7: CLOUD, BACKUP & SECURITY */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'cloud' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Security & Change Password Card */}
              <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                  <Lock className="w-4 h-4 text-theme-accent" />
                  <span>{isRTL ? 'حماية لوحة التحكم وتغيير كلمة المرور' : 'Admin Password & Access Control'}</span>
                </h3>

                <p className="text-xs sm:text-sm text-theme-muted">
                  {isRTL
                    ? 'يمكنك تعيين كلمة مرور مخصصة للوحة التحكم لمنع أي زائر من الدخول أو تعديل البيانات.'
                    : 'Configure your custom master admin password to secure dashboard modifications.'}
                </p>

                <form onSubmit={handleChangePassword} className="max-w-md space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'كلمة المرور الجديدة' : 'New Master Password'}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isRTL ? 'أدخل كلمة مرور جديدة (4 أحرف فأكثر)' : 'Enter new password...'}
                      className="input-field text-xs sm:text-sm py-2 font-mono"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4" />
                    <span>{isRTL ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                  </button>

                  {changePassSuccess && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRTL ? 'تم حفظ وتفعيل كلمة المرور الجديدة بنجاح!' : 'Password updated successfully!'}</span>
                    </p>
                  )}
                </form>
              </div>

              {/* Cloud Database Integration Info */}
              <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                  <Database className="w-4 h-4 text-theme-accent" />
                  <span>{isRTL ? 'التكامل مع قواعد البيانات السحابية (Supabase / Firebase / Cloud SQL)' : 'Cloud Database Integration'}</span>
                </h3>

                <p className="text-xs sm:text-sm text-theme-text-sec leading-relaxed">
                  {isRTL
                    ? 'تمت هيكلة بنية البيانات (Projects, TechStack, SiteContent, Inquiries) بنمط موحد وجاهز للمزامنة الفورية مع Supabase أو Firestore أو ASP.NET Core Web API Backend.'
                    : 'The state layer is normalized and production-ready for direct bidirectional synchronization with Supabase, Firebase Firestore, or custom ASP.NET Core REST API backends.'}
                </p>

                <div className="p-4 rounded-xl bg-theme-bg-sec/50 border border-theme-border font-mono text-xs text-theme-text-sec space-y-2">
                  <div className="flex items-center justify-between text-theme-accent font-bold">
                    <span>SCHEMA CONTRACT DEFINITION</span>
                    <span className="text-[11px]">v1.0.0</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-tight">
{`-- SQL / Supabase Migration Schema
CREATE TABLE projects (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  short_description TEXT,
  short_description_ar TEXT,
  featured BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  api_endpoints JSONB,
  schema_tables JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                  </pre>
                </div>
              </div>

              {/* Backup & Restore Section */}
              <div className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm space-y-4">
                <h3 className="text-base font-bold text-theme-text flex items-center gap-2 border-b border-theme-border pb-3">
                  <Download className="w-4 h-4 text-theme-accent" />
                  <span>{isRTL ? 'النسخ الاحتياطي والاستعادة الكاملة (JSON Backup)' : 'Backup & Data Portability'}</span>
                </h3>

                <p className="text-xs sm:text-sm text-theme-muted">
                  {isRTL
                    ? 'يمكنك تنزيل ملف JSON يحتوي على كافة المشاريع، المهارات، النصوص، والاستفسارات وحفظه، أو رفعه في أي وقت لاستعادة موقعك.'
                    : 'Export all portfolio projects, skills, biography, and messages as a portable JSON snapshot.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="btn-primary text-xs flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isRTL ? 'تصدير نسخة احتياطية (Download .json)' : 'Export JSON Backup'}</span>
                  </button>

                  <label className="btn-ghost text-xs flex items-center gap-2 cursor-pointer border border-theme-border">
                    <Upload className="w-4 h-4 text-theme-accent" />
                    <span>{isRTL ? 'استيراد واستعادة من ملف (Import .json)' : 'Import Backup JSON'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleFactoryReset}
                    className="btn-ghost text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 ms-auto"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isRTL ? 'استعادة إعدادات المصنع الأصلية' : 'Factory Reset Defaults'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PROJECT ADD / EDIT MODAL DRAWER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-bg-sec/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-theme-accent-light flex items-center justify-center text-theme-accent">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-theme-text">
                      {editingProjectId
                        ? isRTL
                          ? 'تعديل بيانات المشروع'
                          : 'Edit Engineering Project'
                        : isRTL
                        ? 'إضافة مشروع جديد'
                        : 'Add New Project'}
                    </h2>
                    <p className="text-[11px] text-theme-muted">
                      {isRTL
                        ? 'أدخل التفاصيل المعمارية وروابط الكود والـ API Playground'
                        : 'Configure architecture layers, swagger playground, and bilingual content'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form onSubmit={handleSaveProject} className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'اسم المشروع (English) *' : 'Project Title (English) *'}
                    </label>
                    <input
                      type="text"
                      value={projectForm.title || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g. DentZone - Dental Clinic SaaS"
                      className="input-field text-xs sm:text-sm py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'اسم المشروع (بالعربي)' : 'Project Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={projectForm.titleAr || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, titleAr: e.target.value })}
                      placeholder="مثال: نظام إدارة العيادات الطبية"
                      className="input-field text-xs sm:text-sm py-2 text-right"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'المعرف اللطيف (Slug)' : 'URL Slug'}
                    </label>
                    <input
                      type="text"
                      value={projectForm.slug || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                      placeholder="dentzone-saas"
                      className="input-field text-xs sm:text-sm py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الدور الوظيفي (Role)' : 'Engineering Role'}
                    </label>
                    <input
                      type="text"
                      value={projectForm.role || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                      placeholder="Full-Stack .NET Engineer"
                      className="input-field text-xs sm:text-sm py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الفترة الزمنية (Period)' : 'Period / Year'}
                    </label>
                    <input
                      type="text"
                      value={projectForm.period || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, period: e.target.value })}
                      placeholder="2024"
                      className="input-field text-xs sm:text-sm py-2 font-mono"
                    />
                  </div>
                </div>

                {/* Short Descriptions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الوصف المختصر (English) *' : 'Short Description (English) *'}
                    </label>
                    <textarea
                      rows={2}
                      value={projectForm.shortDescription || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
                      placeholder="Brief overview shown on cards..."
                      className="input-field text-xs sm:text-sm py-2 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الوصف المختصر (بالعربي)' : 'Short Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={projectForm.shortDescriptionAr || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, shortDescriptionAr: e.target.value })}
                      placeholder="نبذة مختصرة تظهر في البطاقات..."
                      className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                    />
                  </div>
                </div>

                {/* Detailed / Long Descriptions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الوصف التفصيلي (Long Description - EN)' : 'Detailed Description (English)'}
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.longDescription || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                      placeholder="In-depth architecture, domain decisions, and business impact..."
                      className="input-field text-xs sm:text-sm py-2 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'الوصف التفصيلي (بالعربي)' : 'Detailed Description (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.longDescriptionAr || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, longDescriptionAr: e.target.value })}
                      placeholder="شرح معماري كامل ومنطق الأعمال..."
                      className="input-field text-xs sm:text-sm py-2 resize-none text-right"
                    />
                  </div>
                </div>

                {/* Links & Featured Toggle */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'رابط المعاينة المباشرة (Live URL)' : 'Live Demo URL'}
                    </label>
                    <input
                      type="url"
                      value={projectForm.liveUrl || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="input-field text-xs sm:text-sm py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-text mb-1">
                      {isRTL ? 'رابط مستودع GitHub' : 'GitHub Repository URL'}
                    </label>
                    <input
                      type="url"
                      value={projectForm.repoUrl || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="input-field text-xs sm:text-sm py-2 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="featured-toggle"
                      checked={Boolean(projectForm.featured)}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                      className="w-4 h-4 text-theme-accent rounded focus:ring-theme-accent"
                    />
                    <label htmlFor="featured-toggle" className="text-xs font-bold text-theme-text cursor-pointer">
                      {isRTL ? 'مشروع مميز (يظهر في الرئيسية)' : 'Featured on Homepage'}
                    </label>
                  </div>
                </div>

                {/* Project Image & Preset Selector */}
                <div className="space-y-2 pt-2 border-t border-theme-border">
                  <label className="block text-xs font-semibold text-theme-text">
                    {isRTL ? 'صورة الغلاف للمشروع (Image URL / Presets)' : 'Project Banner Image'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={projectForm.image || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="input-field text-xs py-2 font-mono flex-1"
                    />
                  </div>

                  {/* Preset Image Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-theme-muted font-semibold">
                      {isRTL ? 'صور جاهزة سريعة:' : 'Quick Presets:'}
                    </span>
                    {PRESET_PROJECT_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setProjectForm({ ...projectForm, image: preset.url })}
                        className="px-2.5 py-1 rounded-md text-[11px] bg-theme-bg-sec hover:bg-theme-accent hover:text-white border border-theme-border transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {projectForm.image && (
                    <div className="mt-2 h-36 rounded-xl overflow-hidden border border-theme-border bg-slate-950">
                      <ProjectImage
                        src={projectForm.image}
                        alt="Project preview"
                        title={projectForm.title || 'Project Preview'}
                        tags={projectForm.tags || []}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                        aspectRatio="auto"
                      />
                    </div>
                  )}
                </div>

                {/* Tech Stack Badges Tags */}
                <div className="space-y-2 pt-2 border-t border-theme-border">
                  <label className="block text-xs font-semibold text-theme-text">
                    {isRTL ? 'قائمة التقنيات والوسوم (Tech Stack Badges)' : 'Tech Stack Tags'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. .NET 8, SignalR, Redis, Docker (Press Enter)"
                      className="input-field text-xs py-2"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-ghost text-xs px-3 py-2 border border-theme-border"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isRTL ? 'إضافة' : 'Add Tag'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {projectForm.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-accent text-xs flex items-center gap-1.5 py-1 px-2.5"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-300 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Features Builder */}
                <div className="space-y-3 pt-2 border-t border-theme-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-theme-text">
                        {isRTL ? 'أبرز المزايا والخصائص المعمارية (Key Features)' : 'Key Features & Capabilities'}
                      </label>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL
                          ? 'قائمة المزايا التقنية التفصيلية المعروضة داخل صفحة دراسة الحالة'
                          : 'Feature list rendered inside project detail case study'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeyFeature}
                      className="btn-ghost text-xs px-2.5 py-1 text-theme-accent"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'إضافة ميزة' : 'Add Feature'}</span>
                    </button>
                  </div>

                  {projectForm.keyFeatures?.map((kf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={kf.title}
                          onChange={(e) => {
                            const updated = [...(projectForm.keyFeatures || [])];
                            updated[idx].title = e.target.value;
                            setProjectForm({ ...projectForm, keyFeatures: updated });
                          }}
                          placeholder="Feature Title (EN)"
                          className="input-field text-xs py-1 flex-1 font-semibold"
                        />
                        <input
                          type="text"
                          value={kf.titleAr || ''}
                          onChange={(e) => {
                            const updated = [...(projectForm.keyFeatures || [])];
                            updated[idx].titleAr = e.target.value;
                            setProjectForm({ ...projectForm, keyFeatures: updated });
                          }}
                          placeholder="عنوان الميزة (عربي)"
                          className="input-field text-xs py-1 flex-1 text-right font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = projectForm.keyFeatures?.filter((_, i) => i !== idx);
                            setProjectForm({ ...projectForm, keyFeatures: updated });
                          }}
                          className="text-theme-muted hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={kf.description}
                          onChange={(e) => {
                            const updated = [...(projectForm.keyFeatures || [])];
                            updated[idx].description = e.target.value;
                            setProjectForm({ ...projectForm, keyFeatures: updated });
                          }}
                          placeholder="Feature Description (EN)"
                          className="input-field text-xs py-1"
                        />
                        <input
                          type="text"
                          value={kf.descriptionAr || ''}
                          onChange={(e) => {
                            const updated = [...(projectForm.keyFeatures || [])];
                            updated[idx].descriptionAr = e.target.value;
                            setProjectForm({ ...projectForm, keyFeatures: updated });
                          }}
                          placeholder="وصف الميزة (عربي)"
                          className="input-field text-xs py-1 text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* API Playground Endpoints Config */}

                <div className="space-y-3 pt-2 border-t border-theme-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-theme-text">
                        {isRTL ? 'نقاط نهاية الملعب التجريبي (API Playground Endpoints)' : 'Interactive API Endpoints'}
                      </label>
                      <p className="text-[11px] text-theme-muted">
                        {isRTL
                          ? 'تتيح للزوار تجربة استدعاءات API حية داخل صفحة تفاصيل المشروع'
                          : 'Configures live mock endpoints for visitors to test in Swagger Sandbox'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddApiEndpoint}
                      className="btn-ghost text-xs px-2.5 py-1 text-theme-accent"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'إضافة Endpoint' : 'Add Endpoint'}</span>
                    </button>
                  </div>

                  {projectForm.apiEndpoints?.map((ep, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-theme-bg-sec/40 border border-theme-border space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={ep.method}
                          onChange={(e) => {
                            const updated = [...(projectForm.apiEndpoints || [])];
                            updated[idx].method = e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE';
                            setProjectForm({ ...projectForm, apiEndpoints: updated });
                          }}
                          className="input-field text-xs py-1 font-mono w-24 font-bold text-theme-accent"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>

                        <input
                          type="text"
                          value={ep.path}
                          onChange={(e) => {
                            const updated = [...(projectForm.apiEndpoints || [])];
                            updated[idx].path = e.target.value;
                            setProjectForm({ ...projectForm, apiEndpoints: updated });
                          }}
                          placeholder="/api/v1/resource"
                          className="input-field text-xs py-1 font-mono flex-1"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updated = projectForm.apiEndpoints?.filter((_, i) => i !== idx);
                            setProjectForm({ ...projectForm, apiEndpoints: updated });
                          }}
                          className="text-theme-muted hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ep.description}
                        onChange={(e) => {
                          const updated = [...(projectForm.apiEndpoints || [])];
                          updated[idx].description = e.target.value;
                          setProjectForm({ ...projectForm, apiEndpoints: updated });
                        }}
                        placeholder="Description of what this endpoint does..."
                        className="input-field text-xs py-1"
                      />
                    </div>
                  ))}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-border">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="btn-ghost text-xs"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button type="submit" className="btn-primary text-xs sm:text-sm px-6 py-2 shadow-md">
                    <Save className="w-4 h-4" />
                    <span>{isRTL ? 'حفظ المشروع' : 'Save Project'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* ADD SKILL MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-theme-accent" />
                  <span>{isRTL ? 'إضافة مهارة جديدة' : 'Add Technical Skill'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="text-theme-muted hover:text-theme-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewSkill} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">
                    {isRTL ? 'التصنيف (Category)' : 'Category'}
                  </label>
                  <select
                    value={selectedCategoryForSkill}
                    onChange={(e) => setSelectedCategoryForSkill(e.target.value)}
                    className="input-field text-xs py-2 font-semibold"
                  >
                    {techStack.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-text mb-1">
                    {isRTL ? 'اسم المهارة / الأداة (Skill Name) *' : 'Skill / Tool Name *'}
                  </label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. ASP.NET Core, SignalR, RabbitMQ"
                    className="input-field text-xs py-2"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-theme-text mb-1">
                    <span>{isRTL ? 'مستوى الإتقان (Proficiency)' : 'Proficiency'}</span>
                    <span className="font-mono text-theme-accent">{newSkillProficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(Number(e.target.value))}
                    className="w-full h-1.5 bg-theme-bg-sec rounded-lg appearance-none cursor-pointer accent-theme-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border">
                  <button
                    type="button"
                    onClick={() => setIsSkillModalOpen(false)}
                    className="btn-ghost text-xs"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-primary text-xs px-4 py-2">
                    {isRTL ? 'إضافة المهارة' : 'Add Skill'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* CONFIRMATION DIALOG MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-theme-text">{confirmModal.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-theme-text-sec leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="btn-ghost text-xs"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="btn-primary bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-2"
                >
                  {isRTL ? 'تأكيد الحذف' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
