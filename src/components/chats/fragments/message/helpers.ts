// Helper function to get initials from name
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Helper function to format chat message timestamp
export function formatChatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Reset time to midnight for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Calculate difference in days
  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  if (diffDays === 1) {
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `yesterday ${time}`;
  }

  // This year: "Tue 13 Nov"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  // Previous years: "13 Dec 2013"
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
