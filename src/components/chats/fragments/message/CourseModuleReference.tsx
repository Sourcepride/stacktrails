import { FaBook } from "@react-icons/all-files/fa/FaBook";

type CourseModuleReferenceProps = {
  courseTitle: string;
  moduleTitle?: string;
};

export default function CourseModuleReference({
  courseTitle,
  moduleTitle,
}: CourseModuleReferenceProps) {
  return (
    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <FaBook className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          Course Module Reference
        </span>
      </div>
      <p className="text-xs text-blue-700">{courseTitle}</p>
      {moduleTitle && (
        <p className="text-xs text-blue-600 mt-1">Module: {moduleTitle}</p>
      )}
    </div>
  );
}

