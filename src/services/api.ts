// src/services/api.ts
import type { GitHubMetrics, Project, TechStackCategory, AiEvaluationCase, Inquiry } from '@/types';
import {
  getStoredInquiries,
  addInquiryToStore,
  updateInquiryStatusInStore,
  verifyAdminCredentials,
  verifyAdminPassword,
  setAdminAuthenticated,
  getStoredProjects,
  getStoredTechStack,
} from '@/services/dataStorage';

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
  await new Promise((resolve) => setTimeout(resolve, 350));
  
  if (password && verifyAdminCredentials(email, password)) {
    setAdminAuthenticated(true);
    return {
      accessToken: `admin_token_${Date.now()}`,
      user: {
        email: email || 'mrashed19951995@gmail.com',
        role: 'Admin',
      },
    };
  }

  // If only password provided as first arg
  if (email && !password && verifyAdminPassword(email)) {
    setAdminAuthenticated(true);
    return {
      accessToken: `admin_token_${Date.now()}`,
      user: {
        email: 'mrashed19951995@gmail.com',
        role: 'Admin',
      },
    };
  }

  throw new Error('Invalid admin credentials. Please check your email and password.');
}

export async function updateInquiryStatus(
  id: string,
  status: 'New' | 'Read' | 'Archived'
): Promise<{ success: boolean; id: string; status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  updateInquiryStatusInStore(id, status);
  return { success: true, id, status };
}

