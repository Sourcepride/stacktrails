import React, { PropsWithChildren } from "react";

type props = PropsWithChildren & {};

const AppDrawerSectionHeader: React.FC<props> = ({ children }) => {
  return (
    <div className="w-full bg-gray-100  font-semibold px-4 py-2">
      {children}
    </div>
  );
};

export default AppDrawerSectionHeader;
