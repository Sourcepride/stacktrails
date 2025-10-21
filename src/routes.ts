export class PublicRoutes {
  constructor(private readonly locale: string) {}

  static LOGIN = `/auth/login`;
  static REGISTER = `/auth/register`;
  static HOME = `/`;
  static POLICY = `/site/privacy-policy`;
  static TERMS = `/site/terms-and-conditions`;
  static FAQs = `/site/faqs`;
  static SUPPORT = `/site/support`;
  static COURSES = `/courses`;
  static CONTACT = `/contact`;
  static ABOUT = "/about";
  static BLOG = "/blog";
  static PAID_COURSES = "/paid-courses";

  static getCourseRoute(slug: string) {
    return `/course/${slug}`;
  }
  static getTopicRoute(slug: string) {
    return `/topic/${slug}`;
  }
  static getAuthor(u: string) {
    return `/author/${u}`;
  }
}
export class AppRoutes {
  static DASHBOARD = `/dashboard/`;
  static ACCOUNT = `/dashboard/account`;
  static ENROLLED = `/dashboard/enrolled`;
  static SAVED = `/dashboard/saved`;
  static CREATED = `/dashboard/created`;
  static CREATE_COURSE = `/create/course`;

  static getCreatedCourseRoute(slug: string) {
    return `/create/course/${slug}`;
  }
  static CREATE_SECTION(slug: string) {
    return `/create/course/${slug}/sections/create`;
  }

  static getPreviewCreatedCourseRoute(slug: string) {
    return `/preview/${slug}`;
  }
  static CREATED_COURSE_SECTION(slug: string) {
    return `/create/course/${slug}/sections`;
  }
  static CREATED_COURSE_EDIT(slug: string) {
    return `/create/course/${slug}/edit`;
  }

  static EDIT_SECTION(section_id: string) {
    return `/create/section/${section_id}/edit`;
  }
  static EDIT_MODULE(section_id: string, module_id: string) {
    return `/create/section/${section_id}/module/${module_id}`;
  }
  static SECTION_MODULES(section_id: string) {
    return `/create/section/${section_id}`;
  }
  static getEnrolledCourseRoute(slug: string) {
    return `/course/enrolled/${slug}`;
  }
  static getEnrolledCourseModuleRoute(slug: string, module_id: string) {
    return `/course/enrolled/${slug}/${module_id}`;
  }

  static getCreateModuleRoute(section_id: string) {
    return `/create/section/${section_id}/module`;
  }

  static getCreatedModuleRoute(section_id: string, module_id: string) {
    return `/create/section/${section_id}/module/${module_id}`;
  }
}

export class BackendRoutes {
  static MY_ACCOUNT = "/account";
  static GITHUB_LOGIN = "/auth/github/login";
  static GOOGLE_LOGIN = "/auth/google/login";
  static GOOGLE_ONE_TAP = "/auth/google-one-tap";
  static LOGOUT = "/auth/logout";
  static ALL_COURSES = "/courses";
  static COURSE_DETAIL = (slug: string) => `/courses/${slug}`;
  static COURSE_CONTENT_MINIMAL = (slug: string) =>
    `/courses/${slug}/content/minimal`;
  static COURSE_CONTENT_FULL = (slug: string) =>
    `/courses/${slug}/content/full`;
  static COURSE_COMMENTS = (course_id: string) =>
    `/courses/${course_id}/comments`;
  static COMMENT_REPLIES = (comment_id: string) =>
    `/courses/${comment_id}/replies`;
  static LIKE_COMMENT = (comment_id: string) =>
    `/courses/${comment_id}/like-unlike`;
  static COURSE_REVIEW = (course_id: string) => `/courses/${course_id}/ratings`;
  static CREATE_SECTION = "/courses/section";
  static UPDATE_SECTION = (id: string) => `/courses/section/${id}`;
  static CREATE_MODULE = `/courses/module`;

  static CREATE_RATING = "/courses/ratings";
  static ENROLL = "/courses/enroll";
  static CREATE_COMMENT = "/courses/comments";
  static GET_COURSE_ENROLLMENT = (course_id: string) =>
    `/courses/${course_id}/enroll`;
  static GET_SECTION = (section_id: string) => `/courses/section/${section_id}`;
  static GET_MODULE = (module_id: string) => `/courses/module/${module_id}`;
  static GET_FULL_MODULE = (module_id: string) =>
    `/courses/module/full/${module_id}`;

  static LIST_ACTIVE_PROVIDERS = "/list-active-providers";
  static LIST_ACTIVE_STORAGE_PROVIDERS = "/list-active-storage-providers";
  static LIST_ALL_FOLDERS = "/folders";
  static LIST_ALL_FILES = "/files";
  static GOOGLE_INCREMENTAL = "/auth/google/increment";
  static DROPBOX_AUTH = "/auth/providers/dropbox/login";
  static REPLACE_PROVIDER = "/auth/replace-provider";
  static LIST_SUB_FOLDERS_AND_FILES = "/subitems";
  static GOOGLE_SHORT_LIVED = "/auth/google/shortlived";
  static DROP_BOX_SHORT_LIVED = "/auth/drobox/shortlived";
  static VALIDATE_DOCUMENT = "/documents/validate";
  static CREATE_VIDEO = "/courses/video";
  static CREATE_DOCUMENT = "/courses/document";
  static CREATE_ATTACHMENT = "/courses/add-attachments";
  static REMOVE_ATTACHMENT = (id: string) => `/courses/remove-attachment/${id}`;
  static UPDATE_VIDEO = (id: string) => "/courses/video" + `/${id}`;
  static UPDATE_DOCUMENT = (id: string) => "/courses/document" + `/${id}`;
  static UPDATE_MODULE = (id: string) => `/courses/module/${id}`;
  static STUDENT_DASHBOARD = "/student/dashboard";
  static ENROLLED_COURSES = "/student/enrolled";
  static CREATED_COURSE = "/creators/created";
  static CREATORS_STATS = "/creators/courses/stats";
  static COURSE_PROGRESS = (course_id: string) =>
    `/courses/${course_id}/progress`;
  static TOGGLE_MODULE_COMPLETED = "/student/toggle-module-completed";
  static INCREMENT_PROGRESS = "/student/increment-progress";
  static GET_MY_ANNOTATIONS = (doc_id: string) =>
    `/student/document/${doc_id}/annotations`;
  static USER_PROFILE = (u: string) => `/account/${u}`;
  static ACCOUNT_COURSES = (u: string) => `/creators/pages/${u}`;
  static CONTACT_FORM = "/management/contact";
  static USERNAME_EXISTS = "/account/username/exists";
  static UPDATE_USERNAME = "/account/username";
  static EXPLORE = "/courses/explore";
  static TAGS = "/courses/tags";
  static WS_SHORT_LIVED = "/auth/ws-shortlived";
}
