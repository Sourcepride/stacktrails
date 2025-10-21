const AppDrawerRow: React.FC<{ header: string; jsx: React.ReactNode }> = ({
  header,
  jsx,
}) => (
  <div className="flex items-center gap-2 border-b border-[#e5e5e7] px-2 py-4 text-sm font-medium">
    <div className="basis-[45%] capitalize">{header}:</div>
    <div className="basis-[55%]">{jsx}</div>
  </div>
);

export default AppDrawerRow;
