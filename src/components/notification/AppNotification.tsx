import { BsBell } from "@react-icons/all-files/bs/BsBell";
import NotificationArray from "./NotificationArray";

type AppNotificationProps = {};
const AppNotification: React.FC<AppNotificationProps> = ({}) => {
  return (
    <div className="relative">
      <button type="button" className="[appearance:none] translate-y-[0.2rem]">
        <BsBell className="w-5 h-5" />
      </button>

      <NotificationArray />
    </div>
  );
};

export default AppNotification;
