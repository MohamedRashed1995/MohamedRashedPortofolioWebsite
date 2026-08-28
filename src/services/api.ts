// src/services/api.ts
import type { GitHubMetrics, Project, TechStackCategory, AiEvaluationCase, Inquiry } from '@/types';

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

const LOCAL_INQUIRIES_KEY = 'portfolio_inquiries_store';

function getStoredInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: 'inq-sample-1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@techrecruiting.io',
      message: 'Impressive .NET Clean Architecture samples. We would love to discuss a Senior Backend role with our team.',
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
}

function saveStoredInquiries(list: Inquiry[]): void {
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

async function safeFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type');

  if (!response.ok || !contentType || !contentType.includes('application/json')) {
    throw new Error('API Endpoint unavailable');
  }

  return response.json();
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    return await safeFetch<Project[]>('/api/v1/projects');
  } catch {
    return [];
  }
}

export async function fetchGithubMetrics(): Promise<GitHubMetrics> {
  return await safeFetch<GitHubMetrics>('/api/github');
}

export async function fetchTechStack(): Promise<TechStackCategory[]> {
  return await safeFetch<TechStackCategory[]>('/api/v1/tech-stack');
}

export async function fetchAiCases(): Promise<AiEvaluationCase[]> {
  return await safeFetch<AiEvaluationCase[]>('/api/v1/ai-cases');
}

export async function submitInquiry(input: CreateInquiryInput): Promise<CreateInquiryResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

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

  return {
    id: newInq.id,
    status: newInq.status,
    createdAt: newInq.createdAt,
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getStoredInquiries();
}

export async function loginAdmin(email: string, password?: string): Promise<{ accessToken: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (email && (password || true)) {
    return { accessToken: `jwt_token_${Date.now()}` };
  }
  throw new Error('Invalid credentials');
}

export async function updateInquiryStatus(id: string, status: 'New' | 'Read' | 'Archived'): Promise<{ success: boolean; id: string; status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const list = getStoredInquiries();
  const found = list.find((i) => i.id === id);
  if (found) {
    found.status = status;
    saveStoredInquiries(list);
  }
  return { success: true, id, status };
}
