// Enum types
type ChatType = "direct" | "group";
type MessageType = "text" | "image" | "file" | "system";
type MemberRole = "member" | "admin" | "moderator";
type MemberStatus = "active" | "left" | "removed" | "banned";
type GroupChatPrivacy = "public" | "private" | "restricted";

// Base types
type ChatBase = {
  chat_type: ChatType;
  name?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  privacy?: GroupChatPrivacy | null;
  is_active: boolean;
  last_message_at: string; // ISO datetime string
};

type ChatMemberBase = {
  role: MemberRole;
  status: MemberStatus;
  joined_at: string; // ISO datetime string
  left_at?: string | null; // ISO datetime string
  notifications_enabled: boolean;
  is_pinned: boolean;
};

type MessageBase = {
  message_type: MessageType;
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  is_edited: boolean;
  edited_at?: string | null; // ISO datetime string
  is_deleted: boolean;
  deleted_at?: string | null; // ISO datetime string
  extra_data?: Record<string, any> | null;
};

type MessageReactionBase = {
  emoji: string;
};

type ChatInviteBase = {
  invite_code?: string | null;
  max_uses?: number | null;
  current_uses: number;
  expires_at?: string | null; // ISO datetime string
  is_active: boolean;
};

// Account and Course types (referenced but not defined in chat models)
// Using existing types from the codebase
type AccountRead = {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  profile?: {
    id: string;
    account_id: string;
    display_name?: string;
    bio?: string;
    avatar?: string;
    username?: string;
    x?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
    instagram?: string;
    language?: string;
  };
  created_at?: string;
  updated_at?: string;
};

type CourseRead = {
  id: string;
  slug: string;
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
  account_id: string;
  author?: {
    email: string;
    username: string;
    is_active: boolean;
    id: string;
  };
  average_rating?: number;
  total_rating?: number;
  stars?: number;
  enrollment_count?: number;
  comment_count?: number;
  updated_at?: string;
};

// Paginated schema base
type PaginatedSchema = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

// Read types (for API responses)
type ChatRead = {
  chat_type: ChatType;
  name?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  privacy?: GroupChatPrivacy | null;
  is_active: boolean;
  last_message_at: string;
  id: string;
  account_id?: string | null;
  course_id?: string | null;
  course?: CourseRead | null;
  account?: AccountRead | null;
  created_at?: string;
  updated_at?: string;
};

type ChatMemberRead = {
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  left_at?: string | null;
  notifications_enabled: boolean;
  is_pinned: boolean;
  id: string;
  chat_id: string;
  account_id: string;
  last_read_message_id?: string | null;
  is_admin: boolean;
  is_creator: boolean;
  account: AccountRead;
  created_at?: string;
  updated_at?: string;
};

type ChatMessageReactionRead = {
  emoji: string;
  id: string;
  message_id: string;
  account_id: string;
  account: AccountRead;
  created_at?: string;
  updated_at?: string;
};

type ChatMessageRead = {
  message_type: MessageType;
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  is_edited: boolean;
  edited_at?: string | null;
  is_deleted: boolean;
  deleted_at?: string | null;
  extra_data?: Record<string, any> | null;
  id: string;
  chat_id: string;
  sender_id?: string | null;
  reply_to_id?: string | null;
  chat: ChatRead;
  sender?: ChatMemberRead | null;
  reply_to?: MessageBase | null;
  reactions: ChatMessageReactionRead[];
  created_at?: string;
  updated_at?: string;
};

type ChatAndUnReadCount = {
  chat: ChatRead;
  unread_count: number;
  has_reply: boolean;
  last_message: ChatMessageRead | null;
};

type ChatStatRead = {
  chat_id: string;
  unread_count: number;
  has_reply: boolean;
};

type PaginatedChatResp = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: ChatAndUnReadCount[];
};

type PaginatedPublicChatResp = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: ChatRead[];
};

type PaginatedMessages = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: ChatMessageRead[];
};

type ChatInviteRead = {
  invite_code?: string | null;
  max_uses?: number | null;
  current_uses: number;
  expires_at?: string | null;
  is_active: boolean;
  id: string;
  chat_id: string;
  invited_account_id: string;
  chat: ChatRead;
  invited_by: ChatMemberRead;
  invited_account: AccountRead;
  created_at?: string;
  updated_at?: string;
};

// Write types (for API requests)
type ChatWrite = {
  chat_type: ChatType;
  name?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  privacy?: GroupChatPrivacy | null;
  last_message_at: string;
  course_id?: string | null;
  associate_account?: string | null;
};

type ChatUpdate = ChatBase;

type ChatMessageWrite = {
  message_type: MessageType;
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;

  extra_data?: Record<string, any> | null;
  chat_id: string;
  reply_to_id?: string | null;
};

type ChatMessageUpdate = {
  content: string;
};

type ChatMessageReactionWrite = MessageReactionBase;

type ChatInviteWrite = {
  chat_id: string;
  invited_account_id?: string | null;
  email?: string | null;
  invite_code?: string | null;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
};

type ChatInviteBulkWrite = {
  data: ChatInviteWrite[];
};

type PaginatedMessagesResp = {
  items: ChatMessageRead[];
  last_message_id: string;
  recent_message_id: string;
  hasNext: boolean;
};

type PaginatedChatMemberRead = {
  items: ChatMemberRead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};
