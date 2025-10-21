import DisplayNote from "./DisplayNote";

const AnnotationPin: React.FC<AnnotationPinProps> = (props) => {
  return <>{props.annotation.type === "note" && <DisplayNote {...props} />}</>;
};

export default AnnotationPin;
