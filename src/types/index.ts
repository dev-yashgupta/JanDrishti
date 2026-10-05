// ============================================================
// JanDrishti AI – Core Type Definitions
// ============================================================

// ── User & Auth ─────────────────────────────────────────────

export type Role = 'CITIZEN' | 'AUTHORITY' | 'SUPER_ADMIN';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn' | 'gu' | 'kn';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  preferred_language: Language;
  city?: string;
  state?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  preferred_language: Language;
  city?: string;
  state?: string;
  role?: Role;
}

// ── Categories ───────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  name_hi?: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

// ── Location ─────────────────────────────────────────────────

export interface Location {
  id: string;
  address?: string;
  city: string;
  district?: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}

// ── Media ────────────────────────────────────────────────────

export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface Media {
  id: string;
  report_id: string;
  url: string;
  thumbnail_url?: string;
  media_type: MediaType;
  filename: string;
  size_bytes: number;
  created_at: string;
}

// ── AI Analysis ──────────────────────────────────────────────

export interface PriorityBreakdown {
  severity: number;
  urgency: number;
  frequency: number;
  community_impact: number;
  persistence: number;
}

export interface AIAnalysis {
  id: string;
  report_id: string;
  predicted_category?: string;
  category_confidence?: number;
  severity_score: number;      // 1–10
  urgency_score: number;       // 1–10
  frequency_score: number;     // 1–10
  community_impact_score: number; // 1–10
  persistence_score: number;   // 1–10
  priority_score: number;      // 0–100
  priority_level: PriorityLevel;
  priority_breakdown: PriorityBreakdown;
  reasoning: string;
  similar_report_ids?: string[];
  cluster_id?: string;
  model_version: string;
  processed_at: string;
}

// ── Report / Problem ─────────────────────────────────────────

export type ReportStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CITIZEN_VERIFICATION'
  | 'CLOSED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Report {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  priority_level: PriorityLevel;
  priority_score?: number;
  category_id: string;
  category?: Category;
  location_id?: string;
  location?: Location;
  reporter_id: string;
  reporter?: User;
  media?: Media[];
  ai_analysis?: AIAnalysis;
  support_count: number;
  view_count: number;
  date_observed?: string;
  contact_info?: string;
  is_anonymous: boolean;
  cluster_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCreateData {
  title: string;
  description: string;
  category_id: string;
  address?: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  date_observed?: string;
  contact_info?: string;
  is_anonymous?: boolean;
}

// ── Status History ───────────────────────────────────────────

export interface StatusHistory {
  id: string;
  report_id: string;
  old_status?: ReportStatus;
  new_status: ReportStatus;
  changed_by_id: string;
  changed_by?: User;
  note?: string;
  created_at: string;
}

// ── Assignment ───────────────────────────────────────────────

export interface Assignment {
  id: string;
  report_id: string;
  assigned_to_id: string;
  assigned_to?: User;
  assigned_by_id: string;
  assigned_by?: User;
  department?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
}

// ── Problem Cluster ──────────────────────────────────────────

export interface ProblemCluster {
  id: string;
  title: string;
  summary?: string;
  category_id: string;
  category?: Category;
  location?: Location;
  report_count: number;
  total_support: number;
  priority_score: number;
  priority_level: PriorityLevel;
  status: ReportStatus;
  representative_report_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClusterDetail extends ProblemCluster {
  reports: Report[];
}

// ── Comment ──────────────────────────────────────────────────

export interface Comment {
  id: string;
  report_id: string;
  author_id: string;
  author?: User;
  content: string;
  is_internal: boolean;        // only visible to authority
  created_at: string;
}

// ── Notification ─────────────────────────────────────────────

export type NotificationType =
  | 'REPORT_VERIFIED'
  | 'REPORT_ASSIGNED'
  | 'REPORT_RESOLVED'
  | 'STATUS_CHANGED'
  | 'NEW_CRITICAL'
  | 'SIMILAR_DETECTED'
  | 'COMMENT_ADDED';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  report_id?: string;
  is_read: boolean;
  created_at: string;
}

// ── Dashboard / Analytics ────────────────────────────────────

export interface DashboardSummary {
  total_reports: number;
  unresolved: number;
  critical: number;
  high_priority: number;
  in_progress: number;
  resolved_this_month: number;
  avg_resolution_days: number;
  reports_today: number;
}

export interface CitizenDashboardSummary {
  total_my_reports: number;
  pending: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  color: string;
}

export interface StatusStat {
  status: ReportStatus;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface CityStat {
  city: string;
  state: string;
  count: number;
}

export interface AnalyticsData {
  by_category: CategoryStat[];
  by_status: StatusStat[];
  by_priority: { level: PriorityLevel; count: number }[];
  reports_over_time: TimeSeriesPoint[];
  by_city: CityStat[];
  avg_resolution_days: number;
  most_persistent: Report[];
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── API Error ────────────────────────────────────────────────

export interface APIError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

// ── Filters ──────────────────────────────────────────────────

export interface ReportFilters {
  search?: string;
  category_id?: string;
  status?: ReportStatus;
  priority_level?: PriorityLevel;
  city?: string;
  state?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'priority' | 'newest' | 'oldest' | 'most_reported' | 'longest_unresolved';
  page?: number;
  per_page?: number;
}

// ── AI Config (Admin) ─────────────────────────────────────────

export interface AIConfig {
  similarity_threshold: number;
  similarity_location_radius_km: number;
  priority_weights: {
    severity: number;
    urgency: number;
    frequency: number;
    community_impact: number;
    persistence: number;
  };
  severity_high_threshold: number;
  urgency_high_threshold: number;
}
