import { BackendRoutes } from "@/routes";
import appAxios from "../axiosClient";

export function getCoursesQueryFn({
  params,
}: {
  params?: Record<string, any>;
}) {
  return async ({ pageParam = 1 }): Promise<Paginated<Course>> => {
    const res = await appAxios.get<Paginated<Course>>(
      BackendRoutes.ALL_COURSES,
      {
        params: { ...params, page: pageParam },
      }
    );

    return res.data;
  };
}

export function getCourseDetailFn({ slug }: { slug: string }) {
  return async (): Promise<Course> => {
    const res = await appAxios.get<Course>(BackendRoutes.COURSE_DETAIL(slug));

    return res.data;
  };
}
export function getMinimalCourseContent({ slug }: { slug: string }) {
  return async (): Promise<CourseContentMin> => {
    const res = await appAxios.get<CourseContentMin>(
      BackendRoutes.COURSE_CONTENT_MINIMAL(slug)
    );

    return res.data;
  };
}
export function getFullCourseContent({ slug }: { slug: string }) {
  return async (): Promise<CourseContentMin> => {
    const res = await appAxios.get<CourseContentMin>(
      BackendRoutes.COURSE_CONTENT_FULL(slug)
    );

    return res.data;
  };
}
export function getCourseProgress({ course_id }: { course_id: string }) {
  return async (): Promise<CourseProgress> => {
    const res = await appAxios.get<CourseProgress>(
      BackendRoutes.COURSE_PROGRESS(course_id)
    );

    return res.data;
  };
}

export function hasEnrolled({ courseId }: { courseId: string }) {
  return async (): Promise<CourseEnrollment> => {
    const res = await appAxios.get<CourseEnrollment>(
      BackendRoutes.GET_COURSE_ENROLLMENT(courseId)
    );

    return res.data;
  };
}

export async function freeEnrollment({
  course_id,
  account_id,
}: {
  course_id: string;
  account_id: string;
}): Promise<EnrollmentResp> {
  const res = await appAxios.post<any>(BackendRoutes.ENROLL, {
    course_id,
    account_id,
  });

  return res.data;
}

export async function createCourseFunction(
  data: CourseCreate
): Promise<Course> {
  const resp = await appAxios.post<any>(BackendRoutes.ALL_COURSES, data);
  return resp.data;
}
export async function updateCourseFunction(
  slug: string,
  data: Partial<CourseCreate>
): Promise<Course> {
  const resp = await appAxios.patch<any>(
    BackendRoutes.COURSE_DETAIL(slug),
    data
  );
  return resp.data;
}

export async function createSectionFunction(
  data: CreateSection
): Promise<Section> {
  const resp = await appAxios.post<any>(BackendRoutes.CREATE_SECTION, data);
  return resp.data;
}

export async function updateSectionFunction(
  id: string,
  data: Partial<CreateSection>
): Promise<Section> {
  const resp = await appAxios.patch<any>(
    BackendRoutes.UPDATE_SECTION(id),
    data
  );
  return resp.data;
}

export function getSectionFn({ section_id }: { section_id: string }) {
  return async (): Promise<FullSection> => {
    const res = await appAxios.get<any>(BackendRoutes.GET_SECTION(section_id));

    return res.data;
  };
}

export function getModuleFn({ module_id }: { module_id: string }) {
  return async (): Promise<FullModule> => {
    const res = await appAxios.get<any>(BackendRoutes.GET_MODULE(module_id));

    return res.data;
  };
}
