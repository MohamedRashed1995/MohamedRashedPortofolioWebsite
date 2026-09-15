// src/services/api.ts
import type {
  GitHubMetrics,
  Project,
  TechStackCategory,
  AiEvaluationCase,
  Inquiry,
  TechnologyDto,
  BackendProjectDto,
  ApiEndpoint,
  ArchitectureLayer,
} from '@/types';
import { SEED_PROJECTS, githubMetrics, SEED_TECH_STACK, SEED_AI_CASES } from '@/data/seed';

export const PROD_BACKEND_URL = 'https://mohamedrashedportofolio.runasp.net';
export const ADMIN_TOKEN_KEY = 'admin_access_token';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    if (configured.includes('localhost') || configured.includes('127.0.0.1')) {
      return '';
    }
    return configured.replace(/\/+$/, '');
  }
  // If running in production build, default directly to production ASP.NET Core backend
  if (import.meta.env.PROD) {
    return PROD_BACKEND_URL;
  }
  // In development, return empty string so calls go through Vite proxy to http://mohamedrashedportofolio.runasp.net
  return '';
}

export function buildApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAdminToken();
    throw new ApiError('Unauthorized: Invalid or expired session.', 401);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    let errorData = null;
    if (isJson) {
      try {
        errorData = await response.json();
        if (errorData && typeof errorData === 'object') {
          errorMsg = (errorData as { message?: string; title?: string }).message || (errorData as { message?: string; title?: string }).title || errorMsg;
        }
      } catch {
        // ignore
      }
    }
    throw new ApiError(errorMsg, response.status, errorData);
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export function mapBackendProjectToProject(dto: BackendProjectDto): Project {
  // Find matching seed project if available to preserve rich localization and screenshot assets
  const seedMatch = SEED_PROJECTS.find((p) => p.slug === dto.slug || p.id === dto.id);

  const tags =
    Array.isArray(dto.technologies) && dto.technologies.length > 0
      ? dto.technologies
      : (dto as unknown as { tags?: string[] }).tags || seedMatch?.tags || [];

  const longDescription =
    dto.description || (dto as unknown as { longDescription?: string }).longDescription || dto.shortDescription || '';

  const endpoints: ApiEndpoint[] =
    Array.isArray(dto.endpoints) && dto.endpoints.length > 0
      ? dto.endpoints.map((e) => ({
          method: e.method,
          path: e.path,
          description: e.description,
          sampleResponse: e.sampleResponse,
        }))
      : (dto as unknown as { apiEndpoints?: ApiEndpoint[] }).apiEndpoints || seedMatch?.apiEndpoints || [];

  const layers: ArchitectureLayer[] =
    Array.isArray(dto.architectureLayers) && dto.architectureLayers.length > 0
      ? dto.architectureLayers.map((l) => ({
          name: l.name,
          nameAr: seedMatch?.layers?.find((sl) => sl.name === l.name)?.nameAr,
          description: l.description,
          descriptionAr: seedMatch?.layers?.find((sl) => sl.name === l.name)?.descriptionAr,
          responsibilities: l.responsibilities,
          responsibilitiesAr: seedMatch?.layers?.find((sl) => sl.name === l.name)?.responsibilitiesAr,
        }))
      : (dto as unknown as { layers?: ArchitectureLayer[] }).layers || seedMatch?.layers || [];

  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    titleAr: seedMatch?.titleAr,
    shortDescription: dto.shortDescription,
    shortDescriptionAr: seedMatch?.shortDescriptionAr,
    longDescription,
    longDescriptionAr: seedMatch?.longDescriptionAr,
    keyFeatures: seedMatch?.keyFeatures,
    tags,
    role: dto.role || seedMatch?.role || 'Full-Stack Engineer',
    roleAr: seedMatch?.roleAr,
    period: dto.period || seedMatch?.period || '2023 — Present',
    featured: Boolean(dto.featured),
    image: seedMatch?.image,
    repoUrl: dto.repoUrl || seedMatch?.repoUrl,
    liveUrl: seedMatch?.liveUrl,
    thumbnailColor:
      dto.thumbnailColor || seedMatch?.thumbnailColor || 'from-blue-600/20 via-cyan-600/10 to-transparent',
    layers,
    apiEndpoints: endpoints,
    schemaTables: dto.schemaTables || seedMatch?.schemaTables,
    databaseSchema: dto.schemaTables || seedMatch?.databaseSchema,
  };
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await apiFetch<BackendProjectDto[]>('/api/v1/projects');
    if (Array.isArray(res) && res.length > 0) {
      return res.map(mapBackendProjectToProject);
    }
    return SEED_PROJECTS;
  } catch (err) {
    console.warn('Projects API request failed; using local fallback.', err);
    return SEED_PROJECTS;
  }
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const raw = await apiFetch<BackendProjectDto>(`/api/v1/projects/${encodeURIComponent(slug)}`);
    if (raw && typeof raw === 'object' && raw.title) {
      return mapBackendProjectToProject(raw);
    }
    const seed = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
    return seed || null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      const seed = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
      return seed || null;
    }
    console.warn(`Project (${slug}) API request failed; checking seed fallback.`, err);
    const seed = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
    if (seed) return seed;
    throw err;
  }
}

export function normalizeGithubMetrics(raw: unknown): GitHubMetrics {
  const fallback = githubMetrics;
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const res = raw as Record<string, unknown>;

  // Normalize top languages
  let languages: { language: string; percentage: number }[] = [];
  const rawLangs = Array.isArray(res.topLanguages)
    ? res.topLanguages
    : Array.isArray(res.languages)
      ? res.languages
      : [];

  if (rawLangs.length > 0) {
    const validMap = new Map<string, number>();

    for (const item of rawLangs) {
      if (!item || typeof item !== 'object') continue;
      const record = item as Record<string, unknown>;

      // Check language / name / Language / Name
      const nameCandidate =
        record.language ??
        record.name ??
        record.Language ??
        record.Name;

      if (typeof nameCandidate !== 'string') continue;
      const cleanName = nameCandidate.trim();
      if (
        !cleanName ||
        cleanName.toLowerCase() === 'null' ||
        cleanName.toLowerCase() === 'undefined' ||
        cleanName.toLowerCase() === 'unknown'
      ) {
        continue;
      }

      // Disallow generic placeholder labels
      if (/^language\s*\d*$/i.test(cleanName) || cleanName.toLowerCase() === 'top language') {
        continue;
      }

      // Check percentage / percent / Percentage / Percent
      const pctCandidate =
        record.percentage ??
        record.percent ??
        record.Percentage ??
        record.Percent;

      const num = Number(pctCandidate);
      if (isNaN(num) || !isFinite(num)) continue;

      const clamped = Math.max(0, Math.min(100, Math.round(num * 10) / 10));
      // Only keep entries with meaningful positive percentages
      if (clamped > 0) {
        validMap.set(cleanName, (validMap.get(cleanName) || 0) + clamped);
      }
    }

    if (validMap.size > 0) {
      languages = Array.from(validMap.entries()).map(([lang, pct]) => ({
        language: lang,
        percentage: Math.min(100, pct),
      }));
    }
  }

  // If real languages are not present or empty from backend sync, use curated seed fallback
  const finalLanguages = languages.length > 0 ? languages : fallback.topLanguages;

  const totalReposNum = Number(res.totalRepos);
  const totalRepos = !isNaN(totalReposNum) && totalReposNum > 0 ? totalReposNum : fallback.totalRepos;

  const commitsNum = Number(res.totalCommitsLast90Days ?? (res as { totalCommits?: unknown }).totalCommits);
  const totalCommits = !isNaN(commitsNum) && commitsNum > 0 ? commitsNum : fallback.totalCommitsLast90Days;

  const lastSynced =
    typeof res.lastSyncedAt === 'string' && res.lastSyncedAt.trim() && !isNaN(new Date(res.lastSyncedAt).getTime())
      ? res.lastSyncedAt
      : fallback.lastSyncedAt;

  return {
    totalRepos,
    topLanguages: finalLanguages,
    totalCommitsLast90Days: totalCommits,
    lastSyncedAt: lastSynced,
  };
}

export async function fetchGithubMetrics(): Promise<GitHubMetrics> {
  try {
    const res = await apiFetch<unknown>('/api/v1/github/metrics');
    return normalizeGithubMetrics(res);
  } catch {
    return normalizeGithubMetrics(null);
  }
}

export async function fetchTechnologies(): Promise<TechnologyDto[]> {
  try {
    const list = await apiFetch<TechnologyDto[]>('/api/v1/technologies');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function fetchTechStack(): Promise<TechStackCategory[]> {
  try {
    const technologies = await fetchTechnologies();
    if (technologies.length > 0) {
      const grouped: Record<string, { name: string; proficiency: number }[]> = {};
      for (const tech of technologies) {
        if (!grouped[tech.category]) {
          grouped[tech.category] = [];
        }
        let prof = 80;
        const seedCat = SEED_TECH_STACK.find((c) => c.category === tech.category);
        const seedItem = seedCat?.items.find((i) => i.name.toLowerCase() === tech.name.toLowerCase());
        if (seedItem) {
          prof = seedItem.proficiency;
        }
        grouped[tech.category].push({ name: tech.name, proficiency: prof });
      }
      return Object.entries(grouped).map(([category, items]) => ({ category, items }));
    }
    return SEED_TECH_STACK;
  } catch {
    return SEED_TECH_STACK;
  }
}

export async function fetchAiCases(): Promise<AiEvaluationCase[]> {
  try {
    const res = await apiFetch<AiEvaluationCase[]>('/api/v1/ai/cases');
    return Array.isArray(res) && res.length > 0 ? res : SEED_AI_CASES;
  } catch {
    return SEED_AI_CASES;
  }
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  company?: string;
  message: string;
  inquiryType: Inquiry['inquiryType'];
}

export interface CreateInquiryResult {
  id: string;
  status: string;
  createdAt: string;
}

export async function submitInquiry(input: CreateInquiryInput): Promise<CreateInquiryResult> {
  const payload = {
    name: input.name,
    email: input.email,
    company: input.company || null,
    inquiryType: input.inquiryType,
    message: input.message,
  };

  const res = await apiFetch<CreateInquiryResult>('/api/v1/contact/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return {
    id: res.id,
    status: res.status,
    createdAt: res.createdAt,
  };
}

export async function loginAdmin(email: string, password?: string): Promise<{ accessToken: string; expiresAt?: string }> {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const result = await apiFetch<{ accessToken: string; expiresAt: string }>('/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!result || !result.accessToken) {
    throw new Error('Invalid authentication response from server.');
  }

  setAdminToken(result.accessToken);
  return result;
}

export function logoutAdmin(): void {
  clearAdminToken();
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const token = getAdminToken();
  if (!token) {
    throw new ApiError('Authentication token missing. Please log in.', 401);
  }

  const list = await apiFetch<Array<{
    id: string;
    name: string;
    email: string;
    company?: string | null;
    inquiryType: string;
    message: string;
    status: string;
    createdAt: string;
  }>>('/api/v1/admin/inquiries', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    message: item.message,
    inquiryType: (item.inquiryType as Inquiry['inquiryType']) || 'General',
    status: (item.status as Inquiry['status']) || 'New',
    createdAt: item.createdAt,
  }));
}

export async function updateInquiryStatus(
  id: string,
  status: 'New' | 'Read' | 'Archived'
): Promise<{ success: boolean; id: string; status: string }> {
  const token = getAdminToken();
  if (!token) {
    throw new ApiError('Authentication token missing. Please log in.', 401);
  }

  await apiFetch<void>(`/api/v1/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return { success: true, id, status };
}
