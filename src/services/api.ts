// src/services/api.ts
import type { GitHubMetrics, Project, TechStackCategory, AiEvaluationCase, Inquiry } from '@/types';
import {
  getStoredInquiries,
  addInquiryToStore,
  updateInquiryStatusInStore,
  getStoredProjects,
  getStoredTechStack,
} from '@/services/dataStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

interface ProfileImageResponse {
  url: string;
  version: string;
  contentType: string;
  updatedAt: string;
}

function getAdminToken(): string | undefined {
  try {
    const raw = localStorage.getItem('admin_access_token');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token;
  } catch {
    return undefined;
  }
}

function resolveMediaUrl(url: string): string {
  return new URL(url, API_BASE_URL).toString();
}

async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  message: string;
  inquiryType: Inquiry['inquiryType'];
}

export interface CreateInquiryResult {
  id: string;
  status: string;
  createdAt: string;
}

export async function fetchProjects(): Promise<Project[]> {
  return getStoredProjects();
}

export async function fetchGithubMetrics(): Promise<GitHubMetrics> {
  return {
    totalRepos: 18,
    topLanguages: [
      { language: 'C#', percentage: 65 },
      { language: 'TypeScript', percentage: 20 },
      { language: 'SQL', percentage: 10 },
      { language: 'Docker / YAML', percentage: 5 },
    ],
    totalCommitsLast90Days: 142,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function fetchTechStack(): Promise<TechStackCategory[]> {
  return getStoredTechStack();
}

export async function fetchAiCases(): Promise<AiEvaluationCase[]> {
  return [
    {
      id: 'case-1',
      title: 'EF Core N+1 Query & AsNoTracking Misconfiguration',
      category: 'Backend / EF Core',
      flawedResponse: 'AI generated a query fetching child collections inside a foreach loop without eager loading.',
      identifiedFlaw: 'Severe database roundtrip explosion and memory saturation.',
      correctedEvaluation: 'Replaced with `.Include()` / projection with `.AsNoTracking()` and split query.',
      takeaway: 'Code evaluation caught 85% query degradation before production merge.',
    },
    {
      id: 'case-2',
      title: 'Race Condition in SignalR Multi-Tenant Hub',
      category: 'Concurrency / Distributed',
      flawedResponse: 'AI utilized a static dictionary without `ConcurrentDictionary` or distributed locks.',
      identifiedFlaw: 'Thread contention and potential state corruption across tenant connections.',
      correctedEvaluation: 'Implemented thread-safe `ConcurrentDictionary` with Redis backplane.',
      takeaway: 'Crucial verification for high-throughput real-time systems.',
    },
  ];
}

export async function submitInquiry(input: CreateInquiryInput): Promise<CreateInquiryResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const newInq = addInquiryToStore(input);
  return {
    id: newInq.id,
    status: newInq.status,
    createdAt: newInq.createdAt,
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getStoredInquiries();
}

export interface AdminAuthResult {
  accessToken: string;
  user?: {
    email: string;
    role: string;
  };
}

export async function loginAdmin(email?: string, password?: string): Promise<AdminAuthResult> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readApiError(response));

  const result = (await response.json()) as { accessToken: string; expiresAt: string };
  localStorage.setItem('admin_access_token', JSON.stringify({ token: result.accessToken, expiresAt: result.expiresAt }));
  return { accessToken: result.accessToken, user: { email: email || '', role: 'Admin' } };
}

export async function fetchProfileImage(): Promise<ProfileImageResponse | null> {
  const response = await fetch(`${API_BASE_URL}/profile-image`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readApiError(response));
  const result = (await response.json()) as ProfileImageResponse;
  return { ...result, url: resolveMediaUrl(result.url) };
}

export async function uploadProfileImage(file: File): Promise<ProfileImageResponse> {
  const token = getAdminToken();
  if (!token) throw new Error('Your admin session has expired. Please sign in again.');
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/profile-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error(await readApiError(response));
  const result = (await response.json()) as ProfileImageResponse;
  return { ...result, url: resolveMediaUrl(result.url) };
}

export async function resetProfileImage(): Promise<void> {
  const token = getAdminToken();
  if (!token) throw new Error('Your admin session has expired. Please sign in again.');
  const response = await fetch(`${API_BASE_URL}/profile-image`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(await readApiError(response));
}

export async function updateInquiryStatus(
  id: string,
  status: 'New' | 'Read' | 'Archived'
): Promise<{ success: boolean; id: string; status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  updateInquiryStatusInStore(id, status);
  return { success: true, id, status };
}

