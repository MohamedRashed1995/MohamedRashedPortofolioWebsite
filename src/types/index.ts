export interface KeyFeatureItem {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  shortDescription: string;
  shortDescriptionAr?: string;
  longDescription: string;
  longDescriptionAr?: string;
  keyFeatures?: KeyFeatureItem[];
  tags: string[];
  role: string;
  roleAr?: string;
  period: string;
  featured: boolean;
  image?: string;
  repoUrl?: string;
  liveUrl?: string;
  thumbnailColor: string;
  layers: ArchitectureLayer[];
  apiEndpoints: ApiEndpoint[];
  schemaTables?: SchemaTable[];
  databaseSchema?: SchemaTable[];
}

export interface ArchitectureLayer {
  name: 'Domain' | 'Application' | 'Infrastructure' | 'WebApi';
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  responsibilities: string[];
  responsibilitiesAr?: string[];
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  sampleResponse: unknown;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
  relationships: SchemaRelationship[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
}

export interface SchemaRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface ProjectMetric {
  projectId: string;
  label: string;
  value: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  inquiryType: 'Collaboration' | 'Hiring' | 'Code Review' | 'General';
  status: 'New' | 'Read' | 'Archived';
  createdAt: string;
}

export interface AiEvaluationCase {
  id: string;
  title: string;
  category: string;
  flawedResponse: string;
  identifiedFlaw: string;
  correctedEvaluation: string;
  takeaway: string;
}

export interface CodeReviewSnippet {
  id: string;
  label: string;
  code: string;
  annotations: CodeAnnotation[];
}

export interface CodeAnnotation {
  line: number;
  severity: 'critical' | 'warning' | 'info';
  comment: string;
}

export interface GitHubMetrics {
  totalRepos: number;
  topLanguages: { language: string; percentage: number }[];
  totalCommitsLast90Days: number;
  lastSyncedAt: string;
}

export interface TechStackItem {
  category: string;
  items: { name: string; proficiency: number }[];
}

export type TechStackCategory = TechStackItem;

export interface SiteContent {
  name: string;
  nameAr?: string;
  titleRole: string;
  titleRoleAr?: string;
  heroBadge: string;
  heroBadgeAr?: string;
  heroSubtitle: string;
  heroSubtitleAr?: string;
  statsExperience: string;
  statsExperienceLabel: string;
  statsExperienceLabelAr?: string;
  statsProjects: string;
  statsProjectsLabel: string;
  statsProjectsLabelAr?: string;
  statsArchitecture: string;
  statsArchitectureLabel: string;
  statsArchitectureLabelAr?: string;
  statsAiEvaluations: string;
  statsAiEvaluationsLabel: string;
  statsAiEvaluationsLabelAr?: string;
  cvUrl?: string;
  cvFileName?: string;
  email: string;
  location: string;
  locationAr?: string;
  availability: string;
  availabilityAr?: string;
  githubUrl: string;
  linkedinUrl: string;
  bioHeading: string;
  bioHeadingAr?: string;
  bioParagraph1: string;
  bioParagraph1Ar?: string;
  bioParagraph2: string;
  bioParagraph2Ar?: string;
  bioParagraph3: string;
  bioParagraph3Ar?: string;
}
