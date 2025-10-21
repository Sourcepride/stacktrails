import { ComponentPropsWithoutRef } from "react";
import ErrorMessage from "./ErrorMessage";

type OneFileFieldWrapperProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  hookFormProps: any;
  inputHtmlProps?: ComponentPropsWithoutRef<"input">;
  src?: string | File | FileList | null;
  errorMessage?: string;
  children?: any;
};

export type currentFileInfoType = {
  src: string | undefined;
  isFile: boolean;
  rawFile: File | undefined;
};

const OneFileFieldWrapper = ({
  hookFormProps,
  inputHtmlProps,
  className,
  src,
  children,
  errorMessage,
  ...props
}: OneFileFieldWrapperProps) => {
  return (
    <>
      <div {...props} className={`relative h-fit w-fit ${className}`}>
        <input
          type="file"
          {...inputHtmlProps}
          {...hookFormProps}
          className={`absolute left-0 top-0 z-50 h-full w-full cursor-pointer opacity-0 ${inputHtmlProps?.className}`}
        />
        {typeof children === "function"
          ? (children as any)(getSrcProps(src))
          : children}
      </div>
      <ErrorMessage message={errorMessage} />
    </>
  );
};

export default OneFileFieldWrapper;

function getSrcProps(
  src: string | File | FileList | null | undefined
): currentFileInfoType {
  if (!src) {
    return { src: undefined, isFile: false, rawFile: undefined };
  } else if (src instanceof FileList) {
    return {
      src: src[0] ? URL.createObjectURL(src[0]) : undefined,
      isFile: true,
      rawFile: src[0],
    };
  } else if (src instanceof File) {
    return {
      src: URL.createObjectURL(src),
      isFile: true,
      rawFile: src,
    };
  } else {
    return { src: src, isFile: false, rawFile: undefined };
  }
}
