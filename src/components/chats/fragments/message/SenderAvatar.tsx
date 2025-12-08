import { Avatar } from "@mui/material";

type SenderAvatarProps = {
  avatarUrl?: string;
  name: string;
  initials: string;
};

export default function SenderAvatar({
  avatarUrl,
  name,
  initials,
}: SenderAvatarProps) {
  return (
    <div className="flex-shrink-0">
      <Avatar
        src={avatarUrl || undefined}
        alt={name}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "100%",
          bgcolor: "black",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {initials}
      </Avatar>
    </div>
  );
}

