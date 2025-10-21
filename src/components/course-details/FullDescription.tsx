import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import ExpandableContent from "@/common/utils/ExpandableContent";

type FullDescriptionProps = {
  data: Course;
  t: any;
};
const FullDescription: React.FC<FullDescriptionProps> = ({ data, t }) => {
  return (
    <section className="">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("COURSE_DETAIL.FULL_DESCRIPTION")}
      </h2>

      <div className="w-full ">
        <ExpandableContent maxLines={10}>
          <MarkdownRenderer content={data?.description || ""} />
        </ExpandableContent>
      </div>
    </section>
  );
};

export default FullDescription;
