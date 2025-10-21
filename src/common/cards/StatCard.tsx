type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  content?: string;
  className?: string;
};
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  content,
  className,
}) => {
  return (
    <div
      className={`w-full rounded-xl border border-gray-200 shadow-md  flex flex-col p-6 gap-2 ${className}`}
    >
      <div
        className={`px-2 w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 -translate-x-2`}
      >
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <div className="space-y-1">
        <h4 className="font-medium">{title}</h4>
        {content && <p className="text-sm">{content}</p>}
      </div>
    </div>
  );
};

export default StatCard;
