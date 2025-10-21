import { ComponentProps, PropsWithChildren } from "react";

type PaginationWrapperProps = PropsWithChildren & ComponentProps<"div">;
const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  children,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col gap-y-4 py-4 md:flex-row md:items-center md:justify-between ${props.className}`}
    >
      {children}
    </div>
  );
};

export default PaginationWrapper;
