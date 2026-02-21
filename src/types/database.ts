/**
 * Types pour la base de données Supabase
 * Correspond aux tables créées dans Supabase
 */

// Type pour les églises
export interface Church {
  id: string;
  name: string;
  type: "Centre" | "Assemblée";
  parent_church_id: string | null;
  address: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type pour les tribus
export interface Tribu {
  id: string;
  church_id: string | null;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  icon: string | null;
  order_index: number;
  patriarch_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type pour les profils utilisateurs
export interface Profile {
  id: string;
  church_id: string | null;
  tribu_id: string | null;
  
  // Identité
  first_name: string | null;
  last_name: string | null;
  gender: "Homme" | "Femme" | null;
  date_of_birth: string | null;
  photo_url: string | null;
  
  // Contact
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  
  // Situation
  marital_status: "Célibataire" | "Marié(e)" | "Veuf(ve)" | "Divorcé(e)" | null;
  profession: string | null;
  employer: string | null;
  
  // Spirituel
  date_joined: string | null;
  is_baptized: boolean;
  baptism_date: string | null;
  baptism_certificate_url: string | null;
  
  // Système
  role: string;
  status: "Pending" | "Active" | "Suspended" | "Deleted";
  profile_completion: number;
  last_login: string | null;
  
  // RGPD
  consent_data_processing: boolean;
  consent_communications: boolean;
  consent_date: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations (optionnelles, pour les jointures)
  church?: Church;
  tribu?: Tribu;
}

// Type pour les rôles
export interface Role {
  id: string;
  name: string;
  display_name: string;
  level: number;
  description: string | null;
  permissions: string[];
  created_at: string;
}

// Type pour les membres de tribu
export interface TribuMember {
  id: string;
  tribu_id: string;
  user_id: string;
  joined_at: string;
  status: string;
  is_validated: boolean;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  
  // Relations
  tribu?: Tribu;
  user?: Profile;
}

// Type pour les rôles utilisateur
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  church_id: string;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
  created_at: string;
  
  // Relations
  role?: Role;
  church?: Church;
}

// Type pour la mise à jour du profil
export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  gender?: "Homme" | "Femme";
  date_of_birth?: string;
  photo_url?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  marital_status?: "Célibataire" | "Marié(e)" | "Veuf(ve)" | "Divorcé(e)";
  profession?: string;
  employer?: string;
  is_baptized?: boolean;
  baptism_date?: string;
}

// Type pour calculer la complétion du profil (source de vérité unique)
export const calculateProfileCompletion = (profile: Profile): number => {
  const fields: { value: any; weight: number }[] = [
    { value: profile.first_name, weight: 1 },
    { value: profile.last_name, weight: 1 },
    { value: profile.gender, weight: 1 },
    { value: profile.phone, weight: 1 },
    { value: profile.email, weight: 1 },
    { value: profile.date_of_birth, weight: 1 },
    { value: profile.city, weight: 1 },
    { value: profile.neighborhood, weight: 0.5 },
    { value: profile.marital_status, weight: 1 },
    { value: profile.profession, weight: 0.5 },
    { value: profile.photo_url, weight: 0.5 },
    { value: profile.address, weight: 0.5 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const filledWeight = fields
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== "")
    .reduce((sum, f) => sum + f.weight, 0);

  return Math.round((filledWeight / totalWeight) * 100);
};

// ============================================
// TYPES POUR LES FORMATIONS
// ============================================

export interface Formation {
  id: string;
  church_id: string | null;
  name: string;
  slug: string;
  type: "academie" | "bapteme" | "bergers" | "mission";
  description: string | null;
  duration_months: number | null;
  duration_weeks: number | null;
  is_mandatory: boolean;
  is_active: boolean;
  order_index: number;
  icon: string | null;
  color: string;
  prerequisites: string[];
  created_at: string;
  updated_at: string;
}

export interface FormationSession {
  id: string;
  formation_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  location: string | null;
  instructor_id: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  formation?: Formation;
  instructor?: Profile;
}

export interface FormationModule {
  id: string;
  formation_id: string;
  name: string;
  description: string | null;
  order_index: number;
  duration_hours: number | null;
  content_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FormationEnrollment {
  id: string;
  session_id: string;
  user_id: string;
  status: "pending" | "enrolled" | "in_progress" | "completed" | "failed" | "dropped";
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  progress_percent: number;
  final_score: number | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  session?: FormationSession;
}

export interface FormationProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  module?: FormationModule;
}

// ============================================
// TYPES POUR LA PRIÈRE
// ============================================

export interface PrayerLog {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  type: string | null;
  notes: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrayerGoal {
  id: string;
  user_id: string;
  daily_goal_minutes: number;
  weekly_goal_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FastingLog {
  id: string;
  user_id: string;
  church_id: string | null;
  title: string | null;
  start_date: string;
  end_date: string;
  type: "total" | "partiel" | "daniel" | "liquide";
  intention: string | null;
  is_collective: boolean;
  collective_event_id: string | null;
  status: "planned" | "in_progress" | "completed" | "abandoned";
  completed_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  church_id: string | null;
  tribu_id: string | null;
  subject: string;
  description: string | null;
  urgency: "normal" | "urgent" | "critical";
  is_confidential: boolean;
  is_anonymous: boolean;
  status: "active" | "answered" | "closed";
  prayer_count: number;
  answered_at: string | null;
  testimony: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface PrayerStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_prayer_date: string | null;
  total_prayer_days: number;
  total_prayer_minutes: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES POUR LES FINANCES
// ============================================

export interface DonationType {
  id: string;
  church_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  is_recurring: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "mtn_momo" | "orange_money" | "wave" | "cash" | "bank";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";

export interface Donation {
  id: string;
  church_id: string;
  user_id: string | null;
  type_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  payment_phone: string | null;
  payment_status: PaymentStatus;
  payment_provider_id: string | null;
  payment_metadata: Record<string, any>;
  is_anonymous: boolean;
  is_recurring: boolean;
  recurring_frequency: string | null;
  notes: string | null;
  dedication: string | null;
  receipt_number: string | null;
  receipt_url: string | null;
  receipt_sent: boolean;
  receipt_sent_at: string | null;
  donated_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  donation_type?: DonationType;
}

export interface DonationReceipt {
  id: string;
  donation_id: string;
  user_id: string;
  receipt_number: string;
  fiscal_year: number;
  amount: number;
  currency: string;
  issued_at: string;
  pdf_url: string | null;
  created_at: string;
}

export interface FundraisingProject {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  goal_amount: number | null;
  current_amount: number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  is_active: boolean;
  status: "draft" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateDonationData {
  type_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_phone?: string;
  is_anonymous?: boolean;
  notes?: string;
  dedication?: string;
}

export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  byType: {
    type_id: string;
    type_name: string;
    amount: number;
    count: number;
  }[];
}

// ============================================
// TYPES POUR LES ÉVÉNEMENTS
// ============================================

export type EventType = "culte" | "croisade" | "formation" | "mariage" | "concert" | "reunion" | "jeune" | "priere" | "autre";
export type EventStatus = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled";
export type RegistrationStatus = "registered" | "confirmed" | "cancelled" | "attended" | "no_show";

export interface Event {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  type: EventType;
  category: string | null;
  start_datetime: string;
  end_datetime: string | null;
  is_all_day: boolean;
  timezone: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  is_online: boolean;
  online_link: string | null;
  registration_required: boolean;
  max_participants: number | null;
  registration_deadline: string | null;
  current_participants: number;
  image_url: string | null;
  is_public: boolean;
  target_audience: string;
  target_entity_id: string | null;
  status: EventStatus;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  registered_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  attended_at: string | null;
  notes: string | null;
  created_at: string;
  event?: Event;
}

export interface EventReminder {
  id: string;
  event_id: string;
  user_id: string;
  remind_at: string;
  reminder_type: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

// ============================================
// TYPES POUR LA COMMUNICATION
// ============================================

export type AnnouncementType = "general" | "urgent" | "event" | "prayer" | "testimony";
export type NotificationType = "event" | "announcement" | "prayer" | "donation" | "formation" | "system";

export interface Announcement {
  id: string;
  church_id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: number;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  target_audience: string;
  target_entity_id: string | null;
  is_published: boolean;
  published_at: string;
  expires_at: string | null;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  data: Record<string, any>;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  push_sent: boolean;
  push_sent_at: string | null;
  created_at: string;
}

// ============================================
// TYPES POUR LES MINISTÈRES
// ============================================

export interface Ministere {
  id: string;
  church_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  order_index: number;
  is_active: boolean;
  responsible_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  church_id: string;
  ministere_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  responsible_id: string | null;
  assistant_id: string | null;
  max_members: number | null;
  requires_academie: boolean;
  is_technical: boolean;
  meeting_day: string | null;
  meeting_time: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  members_count?: number;
}

export interface DepartmentMember {
  id: string;
  department_id: string;
  user_id: string;
  role: "serviteur" | "assistant" | "responsable";
  status: "active" | "inactive" | "suspended";
  joined_at: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
  profile?: Profile;
}

export interface Zone {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  chef_zone_id: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  familles_count?: number;
}

export interface FamilleReveil {
  id: string;
  church_id: string;
  zone_id: string | null;
  name: string;
  address: string | null;
  neighborhood: string | null;
  chef_famille_id: string | null;
  mobilisateur_id: string | null;
  meeting_day: string;
  meeting_time: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zone?: Zone;
  members_count?: number;
}

export interface FamilleMember {
  id: string;
  famille_id: string;
  user_id: string;
  role: "membre" | "mobilisateur" | "chef";
  status: string;
  joined_at: string;
  created_at: string;
  famille?: FamilleReveil;
  profile?: Profile;
}

export interface FamilleReport {
  id: string;
  famille_id: string;
  report_date: string;
  total_present: number;
  total_absent: number;
  total_visitors: number;
  total_conversions: number;
  total_offering: number;
  notes: string | null;
  submitted_by: string | null;
  created_at: string;
}

// ============================================
// TYPES POUR L'ADMINISTRATION
// ============================================

export interface ChurchStats {
  total_members: number;
  total_men: number;
  total_women: number;
  pending_members: number;
  baptized_members: number;
  new_members_this_month: number;
  total_tribus: number;
  total_departments: number;
  total_servants: number;
  upcoming_events: number;
  donations_this_month: number;
  donations_count_this_month: number;
}

export interface ValidationRequest {
  id: string;
  church_id: string;
  requester_id: string;
  request_type: "role_change" | "department_join" | "tribu_change" | "profile_validation";
  entity_type: string | null;
  entity_id: string | null;
  current_value: string | null;
  requested_value: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  validator_id: string | null;
  validated_at: string | null;
  validator_notes: string | null;
  created_at: string;
  updated_at: string;
  requester?: Profile;
}

export interface ActivityLog {
  id: string;
  church_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: Profile;
}

export interface ChurchSettings {
  id: string;
  church_id: string;
  welcome_message: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  address: string | null;
  service_times: ServiceTime[];
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  allow_anonymous_donations: boolean;
  require_academie_for_service: boolean;
  max_departments_per_member: number;
  auto_assign_tribu: boolean;
  send_birthday_notifications: boolean;
  send_event_reminders: boolean;
  send_donation_receipts: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceTime {
  day: string;
  time: string;
  name: string;
}

export interface MemberListItem extends Profile {
  tribu_name?: string;
  departments_count?: number;
}