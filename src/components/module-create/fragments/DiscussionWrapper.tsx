import EditorLite from "@/common/markdown/MdEditor";

type discussProps = {
  value?: string;
  setContent: (d: string) => void;
};
const DiscussSection: React.FC<discussProps> = ({ value, setContent }) => {
  return (
    <div className="">
      <EditorLite text={value || ""} changeHandler={setContent} />
    </div>
  );
};

export default DiscussSection;
