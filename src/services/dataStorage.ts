import type { Project, TechStackCategory, SiteContent, Inquiry } from '@/types';
import { SEED_PROJECTS, SEED_TECH_STACK } from '@/data/seed';

export const STORAGE_KEYS = {
  PROJECTS: 'portfolio_custom_projects',
  SITE_CONTENT: 'portfolio_site_content',
  TECH_STACK: 'portfolio_custom_tech_stack',
  INQUIRIES: 'portfolio_inquiries_store',
  ADMIN_PASSWORD: 'portfolio_admin_custom_password',
  AUTH_TOKEN: 'admin_access_token',
} as const;

export const DEFAULT_SITE_CONTENT: SiteContent = {
  name: 'Mohamed Rashed Abdelazim',
  nameAr: 'محمد راشد عبد العظيم',
  titleRole: 'Full-Stack .NET Engineer & AI Evaluation Specialist',
  titleRoleAr: 'مهندس برمجيات Full-Stack .NET ومتخصص تقييم الذكاء الاصطناعي',
  heroBadge: 'Available for .NET & AI Engineering Roles',
  heroBadgeAr: 'متاح لفرص العمل في هندسة .NET وتقييم الذكاء الاصطناعي',
  heroSubtitle:
    'Crafting enterprise-grade distributed systems in ASP.NET Core with Clean Architecture, EF Core, and benchmarking LLM code generation architectures.',
  heroSubtitleAr:
    'تطوير أنظمة موزعة عالية الأداء باستخدام ASP.NET Core والمعمارية النظيفة Clean Architecture، وتدقيق مخرجات نماذج الذكاء الاصطناعي هندسياً.',
  statsExperience: '3+',
  statsExperienceLabel: 'Years Building .NET Systems',
  statsExperienceLabelAr: 'سنوات في تطوير أنظمة .NET',
  statsProjects: '10+',
  statsProjectsLabel: 'Production & Architecture Projects',
  statsProjectsLabelAr: 'مشاريع إنتاجية ومعمارية مكتملة',
  statsArchitecture: '100%',
  statsArchitectureLabel: 'Clean Architecture Compliance',
  statsArchitectureLabelAr: 'التزام كامل بالمعمارية النظيفة',
  statsAiEvaluations: '1.5k+',
  statsAiEvaluationsLabel: 'AI Code Evaluations Executed',
  statsAiEvaluationsLabelAr: 'أكواد تم تدقيقها بالذكاء الاصطناعي',
  cvUrl: '/Mohamed_Rashed_CV.pdf',
  cvFileName: 'Mohamed_Rashed_CV.pdf',
  email: 'mrashed19951995@gmail.com',
  location: 'Cairo, Egypt (Available Globally / Remote)',
  locationAr: 'القاهرة، مصر (متاح عالمياً / عن بُعد)',
  availability: 'Open to Full-Time & Contract Opportunities',
  availabilityAr: 'متاح لفرص العمل بدوام كامل والتعاقدات',
  githubUrl: 'https://github.com/MohamedRashed1995',
  linkedinUrl: 'https://www.linkedin.com/in/mohamed-rashed%E2%80%AC%E2%80%AF-642248283',
  bioHeading: 'Architecting Scalable Systems & Rigorous Code Quality',
  bioHeadingAr: 'بناء أنظمة قابلة للتوسع وضمان أعلى معايير الجودة الهندسية',
  bioParagraph1:
    'I am a Software Engineer focused on building high-performance backend platforms using ASP.NET Core, C#, Entity Framework Core, SQL Server, and modern cloud deployment pipelines.',
  bioParagraph1Ar:
    'أعمل كمهندس برمجيات متخصص في بناء منصات خلفية عالية الأداء باستخدام ASP.NET Core، و C#، و Entity Framework Core، وقواعد بيانات SQL Server، مع أتمتة النشر السحابي الحديث.',
  bioParagraph2:
    'Beyond traditional software engineering, I specialize in AI Evaluation and RLHF benchmarking for code generation models. I assess LLM outputs for algorithmic correctness, security vulnerabilities, edge-case resilience, and idiomatic design patterns.',
  bioParagraph2Ar:
    'إلى جانب الهندسة البرمجية التقليدية، أتخصص في تقييم نماذج الذكاء الاصطناعي (AI Evaluation & RLHF) المولدة للأكواد البرمجية، حيث أختبر المخرجات البرمجية للتأكد من خلوها من الثغرات الأمنية والأخطاء الخفية.',
  bioParagraph3:
    'Whether architecting multi-tenant microservices or testing the boundaries of frontier AI models, my commitment is steadfast: deterministic reliability, test-driven rigor, and clean maintainable code.',
  bioParagraph3Ar:
    'سواء كان الأمر يتعلق بتصميم خدمات مصغرة متعددة المستأجرين (Multi-tenant Microservices) أو اختبار حدود نماذج الذكاء الاصطناعي المتقدمة، يظل هدفي ثابتاً: موثوقية عالية، اختبارات برمجية صارمة، وكود نظيف قابل للصيانة.',
};

export const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-sample-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@techrecruiting.io',
    message:
      'Impressive .NET Clean Architecture samples. We would love to discuss a Senior Backend role with our team.',
    inquiryType: 'Hiring',
    status: 'New',
    createdAt: '2026-08-28T09:15:00Z',
  },
  {
    id: 'inq-sample-2',
    name: 'Karim Mansour',
    email: 'karim@solutions.org',
    message: 'Looking for a code review and architecture audit for our EF Core 8 migration project.',
    inquiryType: 'Code Review',
    status: 'Read',
    createdAt: '2026-08-27T14:30:00Z',
  },
];

// Helper to broadcast custom event across components in the same tab
function broadcastEvent(eventName: string, detail?: unknown) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// ----------------- PROJECTS CRUD -----------------
export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading projects from storage:', err);
  }
  return SEED_PROJECTS;
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    broadcastEvent('portfolio:projects-updated', projects);
  } catch (err) {
    console.error('Error saving projects to storage:', err);
  }
}

export function addProjectToStore(project: Project): Project[] {
  const current = getStoredProjects();
  // Ensure unique ID
  const newProject = {
    ...project,
    id: project.id || `proj-${Date.now()}`,
    slug:
      project.slug ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
  };
  const updated = [newProject, ...current];
  saveStoredProjects(updated);
  return updated;
}

export function updateProjectInStore(id: string, updatedFields: Partial<Project>): Project[] {
  const current = getStoredProjects();
  const index = current.findIndex((p) => p.id === id || p.slug === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedFields };
    saveStoredProjects([...current]);
  }
  return current;
}

export function deleteProjectFromStore(id: string): Project[] {
  const current = getStoredProjects();
  const filtered = current.filter((p) => p.id !== id && p.slug !== id);
  saveStoredProjects(filtered);
  return filtered;
}

export function resetProjectsStore(): Project[] {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    saveStoredProjects(SEED_PROJECTS);
  } catch (err) {
    console.error(err);
  }
  return SEED_PROJECTS;
}

// ----------------- SITE CONTENT -----------------
export function getStoredSiteContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_CONTENT, ...parsed };
    }
  } catch (err) {
    console.error('Error reading site content from storage:', err);
  }
  return DEFAULT_SITE_CONTENT;
}

export function saveStoredSiteContent(content: Partial<SiteContent>): SiteContent {
  const current = getStoredSiteContent();
  const updated = { ...current, ...content };
  try {
    localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(updated));
    broadcastEvent('portfolio:content-updated', updated);
  } catch (err) {
    console.error('Error saving site content:', err);
  }
  return updated;
}

export function resetStoredSiteContent(): SiteContent {
  try {
    localStorage.removeItem(STORAGE_KEYS.SITE_CONTENT);
    broadcastEvent('portfolio:content-updated', DEFAULT_SITE_CONTENT);
  } catch (err) {
    console.error(err);
  }
  return DEFAULT_SITE_CONTENT;
}

// ----------------- TECH STACK / SKILLS -----------------
export function getStoredTechStack(): TechStackCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TECH_STACK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading tech stack from storage:', err);
  }
  return SEED_TECH_STACK;
}

export function saveStoredTechStack(stack: TechStackCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TECH_STACK, JSON.stringify(stack));
    broadcastEvent('portfolio:skills-updated', stack);
  } catch (err) {
    console.error('Error saving tech stack to storage:', err);
  }
}

export function addOrUpdateSkill(
  categoryName: string,
  skillName: string,
  proficiency: number
): TechStackCategory[] {
  const current = getStoredTechStack();
  let category = current.find((c) => c.category.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    category = { category: categoryName, items: [] };
    current.push(category);
  }

  const existingItem = category.items.find(
    (i) => i.name.toLowerCase() === skillName.toLowerCase()
  );
  if (existingItem) {
    existingItem.proficiency = Math.min(100, Math.max(0, proficiency));
  } else {
    category.items.push({
      name: skillName,
      proficiency: Math.min(100, Math.max(0, proficiency)),
    });
  }

  saveStoredTechStack([...current]);
  return current;
}

export function deleteSkillFromStore(categoryName: string, skillName: string): TechStackCategory[] {
  const current = getStoredTechStack();
  const category = current.find((c) => c.category.toLowerCase() === categoryName.toLowerCase());
  if (category) {
    category.items = category.items.filter(
      (i) => i.name.toLowerCase() !== skillName.toLowerCase()
    );
    saveStoredTechStack([...current]);
  }
  return current;
}

export function resetStoredTechStack(): TechStackCategory[] {
  try {
    localStorage.removeItem(STORAGE_KEYS.TECH_STACK);
    saveStoredTechStack(SEED_TECH_STACK);
  } catch (err) {
    console.error(err);
  }
  return SEED_TECH_STACK;
}

// ----------------- INQUIRIES -----------------
export function getStoredInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading inquiries:', err);
  }
  return DEFAULT_INQUIRIES;
}

export function saveStoredInquiries(list: Inquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
    broadcastEvent('portfolio:inquiries-updated', list);
  } catch (err) {
    console.error('Error saving inquiries:', err);
  }
}

export function addInquiryToStore(input: {
  name: string;
  email: string;
  message: string;
  inquiryType: Inquiry['inquiryType'];
}): Inquiry {
  const newInq: Inquiry = {
    id: `inq-${Date.now()}`,
    name: input.name,
    email: input.email,
    message: input.message,
    inquiryType: input.inquiryType,
    status: 'New',
    createdAt: new Date().toISOString(),
  };
  const list = getStoredInquiries();
  list.unshift(newInq);
  saveStoredInquiries(list);
  return newInq;
}

export function updateInquiryStatusInStore(
  id: string,
  status: 'New' | 'Read' | 'Archived'
): Inquiry[] {
  const list = getStoredInquiries();
  const item = list.find((i) => i.id === id);
  if (item) {
    item.status = status;
    saveStoredInquiries([...list]);
  }
  return list;
}

export function deleteInquiryFromStore(id: string): Inquiry[] {
  const list = getStoredInquiries().filter((i) => i.id !== id);
  saveStoredInquiries(list);
  return list;
}

// ----------------- ADMIN SECURITY & AUTH -----------------
export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'mrashed19951995@gmail.com',
  password: 'Password@123',
  name: 'Mohamed Rashed Abdelazim',
  role: 'Admin',
};

export const DEFAULT_ADMIN_PASSWORDS = [
  'Password@123',
  'admin123',
  'admin',
  'Admin@2026!',
  '123456',
];

export function getCustomAdminPassword(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
  } catch {
    return null;
  }
}

export function setCustomAdminPassword(newPass: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
  } catch (err) {
    console.error(err);
  }
}

export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!password || !password.trim()) return false;

  const trimmedPass = password.trim();
  const trimmedEmail = (email || '').trim().toLowerCase();

  // If email is provided, verify matching admin email or standard admin domain
  if (trimmedEmail) {
    const isTargetAdmin =
      trimmedEmail === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() ||
      trimmedEmail.includes('mrashed') ||
      trimmedEmail.includes('admin');
    
    if (isTargetAdmin) {
      if (trimmedPass === DEFAULT_ADMIN_CREDENTIALS.password) return true;
      if (DEFAULT_ADMIN_PASSWORDS.includes(trimmedPass)) return true;
      const custom = getCustomAdminPassword();
      if (custom && custom.trim() === trimmedPass) return true;
    }
  }

  // Password-only check
  if (trimmedPass === DEFAULT_ADMIN_CREDENTIALS.password) return true;
  const custom = getCustomAdminPassword();
  if (custom && custom.trim() === trimmedPass) return true;
  return DEFAULT_ADMIN_PASSWORDS.includes(trimmedPass);
}

export function verifyAdminPassword(input: string): boolean {
  return verifyAdminCredentials(undefined, input);
}

export function isAdminAuthenticated(): boolean {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return Boolean(token);
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authed: boolean): void {
  try {
    if (authed) {
      localStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        JSON.stringify({
          token: `admin_auth_session_${Date.now()}`,
          user: DEFAULT_ADMIN_CREDENTIALS,
          authenticatedAt: new Date().toISOString(),
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------- BACKUP & RESTORE -----------------
export function exportAllDataAsJson(): string {
  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects: getStoredProjects(),
    siteContent: getStoredSiteContent(),
    techStack: getStoredTechStack(),
    inquiries: getStoredInquiries(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importAllDataFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.projects && Array.isArray(parsed.projects)) {
      saveStoredProjects(parsed.projects);
    }
    if (parsed.siteContent && typeof parsed.siteContent === 'object') {
      saveStoredSiteContent(parsed.siteContent);
    }
    if (parsed.techStack && Array.isArray(parsed.techStack)) {
      saveStoredTechStack(parsed.techStack);
    }
    if (parsed.inquiries && Array.isArray(parsed.inquiries)) {
      saveStoredInquiries(parsed.inquiries);
    }
    return true;
  } catch (err) {
    console.error('Failed to parse and import backup JSON:', err);
    return false;
  }
}
