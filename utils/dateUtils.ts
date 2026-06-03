/*
 * Format ISO date string to human readable
 * eg. "2025-12-28T16:51:41Z" -> "Dec 28, 2025"
 */
export const formatDateForDisplay = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/*
 * Returns a relative time string (e.g. 3 days ago, just now) for an ISO date string
 * Falls back to formatDateForDisplay based on cutoff seconds
 */
export const formatRelativeTime = (
  isoString: string,
  cutoffSeconds?: number,
): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (cutoffSeconds && diffInSeconds > cutoffSeconds) {
      return formatDateForDisplay(isoString);
    }

    if (diffInSeconds < 300) return "just now";
    if (diffInSeconds < 1800) return "a few minutes ago";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minutes ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    if (diffInSeconds < 2419200) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }
    if (diffInSeconds < 29030400) {
      const months = Math.floor(diffInSeconds / 2419200);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    const years = Math.floor(diffInSeconds / 29030400);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
};

export const getYear = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.getFullYear().toString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};