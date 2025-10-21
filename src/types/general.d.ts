type Profile = {
  display_name?: string;
  bio?: string;
  avatar?: string;
  id: string;
  account_id: string;
  username?: string;

  // socials
  x?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  instagram?: string;
  language?: string;
};

type User = {
  username: string;
  id: string;
  is_active: boolean;
  email: string;
  profile: Profile;
};

type Paginated<T> = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: T[];
};

type globalUploadStateT = {
  addJob: (job: Omit<UploadJob, "status" | "progress">) => string;
  updateJob: (id: string, data: Partial<UploadJob>) => void;
  removeJob: (id: string) => void;
  jobs: UploadJob[];
};

type ShortLivedToken = {
  access_token: string;
  expires_in: number;
};
