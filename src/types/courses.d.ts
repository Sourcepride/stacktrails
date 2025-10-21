type documentType = "google_drive" | "onedrive" | "dropbox" | "direct_link";
type mediaType = "image" | "pdf" | "document" | "video" | "other";

type Course = {
  title: string;
  image?: string;
  description?: string;
  short_description?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  difficulty_level: string;
  estimated_duration_hours: number;
  language: string;
  status: string;
  enrollment_type: string;
  visibility: string;
  certification_enabled: boolean;
  id: string;
  slug: string;
  account_id: string;
  author: Author;
  average_rating: number;
  total_rating: number;
  stars: number;
  enrollment_count: number;
  comment_count: number;
  updated_at: string;
};

type Author = {
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  id: string;
  profile: Profile_;
};

type CourseContentMin = Course & {
  sections: Section[];
};
interface Section {
  title: string;
  description?: string;
  learning_objectives?: string[];
  order_index: number;
  estimated_duration_minutes: number;
  is_optional: boolean;
  progression_type: string;
  completion_criteria?: string[];
  id: string;
  course_id: string;
  modules: Module[];
}
interface Module {
  title: string;
  description?: string;
  content_data?: Contentdata;
  order_index: number;
  estimated_duration_minutes: number;
  is_required: boolean;
  prerequisites?: string[];
  settings?: Contentdata;
  id: string;
  section_id: string;
  module_type: "video" | "external_link" | "document" | "quiz" | "discussion";
}
type Contentdata = {
  [any]: any;
};
type AdditionalProp1 = {};

type EnrollmentResp = {
  status: string;
  id: string;
  account_id: string;
  course_id: string;
};

type CourseCreate = {
  title: string;
  image: string;
  description: string;
  short_description: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  difficulty_level: string;
  estimated_duration_hours: number;
  language?: string;
  status: string;
  enrollment_type: string;
  visibility: string;
  certification_enabled: boolean;
  tags?: any[];
};

type FullCourse = Course & {
  sections: FullSection[];
  tags: Tag[];
};
type FullSection = Section & {
  modules: FullModule[];
  course: Course;
};
type FullModule = Module & {
  video_content: VideoContent;
  document_content: DocumentContent;
  quiz_content: QuizContent;
  attachments: Attachment[];
};
type Attachment = {
  attachment_type: string;
  file_url: string;
  external_file_id: string;
  embed_url: string;
  title: string;
  description: string;
  document_type: string;
  file_type: string;
  id: string;
  module_id: string;
};
type QuizContent = {
  quiz_settings: Contentdata;
  passing_score: number;
  show_results: string;
  randomize_questions: boolean;
  created_at: string;
  updated_at: string;
  id: string;
  module_id: string;
};
type DocumentContent = {
  platform: string;
  external_file_id: string;
  file_url: string;
  embed_url: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  viewer_settings: Contentdata;
  id: string;
  module_id: string;
};
type VideoContent = {
  platform: string;
  external_video_id: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  title: string;
  description: string;
  embed_settings: Contentdata;
  id: string;
  module_id: string;
  embed_url: string;
};

type Profile_ = {
  display_name: string;
  bio: string;
  avatar: string;
  created_at: string;
  updated_at: string;
  id: string;
  account_id: string;
};

type CreateSection = {
  title: string;
  description?: string;
  learning_objectives?: string[];
  order_index: number;
  estimated_duration_minutes?: number;
  is_optional?: boolean;
  progression_type: string;
  completion_criteria?: string[];
  course_id: string;
};

type CreateMoule = {
  title: string;
  description?: string;
  content_data?: Contentdata;
  order_index: number;
  estimated_duration_minutes?: number;
  is_required?: boolean;
  prerequisites?: string[];
  settings?: Contentdata;
  section_id: string;
  module_type: string;
};

type CreateVideoContent = {
  platform: "youtube" | "dailymotion" | "googledrive" | "dropbox";
  external_video_id: string;
  video_url: string;
  embed_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  title?: string;
  description?: string;
  embed_settings?: Embedsettings;
  module_id: string;
};
type CreateDocumentContent = {
  platform: "google_drive" | "onedrive" | "dropbox" | "direct_link";
  external_file_id: string;
  file_url: string;
  embed_url?: string;
  file_name: string;
  file_type: string;
  file_size_bytes?: number;
  viewer_settings?: Viewersettings;
  module_id: string;
};

interface Embedsettings {
  additionalProp1: AdditionalProp1;
}
interface Viewersettings {
  additionalProp1: AdditionalProp1;
}

type CreateAttachmentContent = {
  attachment_type: "document" | "external_link";
  file_url: string;
  external_file_id?: string;
  embed_url?: string;
  title: string;
  description?: string;
  document_type?: documentType;
  file_type?: string;
  module_id?: string;
};

type DocumentItem = {
  url: string;
  provider: documentType;
  media_type: mediaType;
  title?: string;
  description?: string;
  file_name?: string;
};

type DocumentValidationResponse = {
  is_valid: boolean;
  provider: documentType;
  media_type: mediaType;
  direct_url?: string;
  preview_url?: string;
  embed_url?: string;
  file_size?: number;
  content_type?: string;
  file_name?: string;
  page_count?: number;
  error_message?: string;
};

type StudentStat = {
  completed_courses: number;
  created_courses: number;
  in_progress: number;
};

type CreatorStat = {
  total_enrolled: number;
  total_reviews: number;
  total_comments: number;
  total_published: number;
};

type CourseProgress = {
  status: string;
  start_time: string;
  completion_time: string;
  time_spent_seconds: number;
  progress_data: Progressdata;
  next_module: string;
  next_section: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  id: string;
  account_id: string;
  course_id: string;
};

type Progressdata = {
  [string]: any;
};

type CourseEnrollment = {
  status: string;
  id: string;
  account_id: string;
  course_id: string;
  completion_date: string;
  progress_percentage: number;
};

type EnrolledCourse = {
  course: Course;
  enrollment: CourseEnrollment;
};

type Tag = {
  id: string;
  name: string;
  usage_count: number;
};
