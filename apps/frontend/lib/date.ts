export function getTimeAgo(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);

  if (isNaN(past.getTime())) {
    return "Невалидна дата";
  }

  const diffMs = now.getTime() - past.getTime();

  if (diffMs < 0) {
    return past.toLocaleString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "преди минута";
  }

  if (diffMinutes < 60) {
    return `преди ${diffMinutes} ${getMinutesWord(diffMinutes)}`;
  }

  if (diffHours === 1) {
    return "преди час";
  }

  if (diffHours < 24) {
    return `преди ${diffHours} ${getHoursWord(diffHours)}`;
  }

  if (diffDays === 1) {
    return "преди ден";
  }

  if (diffDays < 7) {
    return `преди ${diffDays} ${getDaysWord(diffDays)}`;
  }

  return past.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMinutesWord(n: number): string {
  if (n === 1) return "минута";
  if (n % 10 === 1 && n !== 11) return "минута";
  return "минути";
}

function getHoursWord(n: number): string {
  if (n === 1) return "час";
  if (n % 10 === 1 && n !== 11) return "час";
  return "часа";
}

function getDaysWord(n: number): string {
  if (n === 1) return "ден";
  if (n % 10 === 1 && n !== 11) return "ден";
  return "дни";
}
