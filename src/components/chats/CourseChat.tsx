"use client";

import ComingSoon from "@/common/utils/ComingSoon";

type CourseChatProps = {
  courseId: string;
};

const CourseChat: React.FC<CourseChatProps> = ({ courseId }) => {
  return <ComingSoon />;
};

export default CourseChat;
