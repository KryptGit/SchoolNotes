export const toDateStr = (date = new Date()) =>
  date.toISOString().slice(0, 10);

export const today = () => toDateStr();

export const isSameDay = (a, b) =>
  toDateStr(new Date(a)) === toDateStr(new Date(b));

export const getWeekDates = (n = 7) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(toDateStr(d));
  }
  return dates;
};

export const calcDurationHours = (bedtimeISO, wakeISO) => {
  const diff = new Date(wakeISO) - new Date(bedtimeISO);
  return Math.round((diff / 36e5) * 100) / 100;
};

export const fmtHoursMin = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const fmtTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const fmtShortDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const fmtDayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString([], { weekday: 'short' });
};

// Convert "HH:MM" local time string to a full ISO string on a given date
export const timeToISO = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
};

export const addMinutesToISO = (isoString, minutes) => {
  return new Date(new Date(isoString).getTime() + minutes * 60000).toISOString();
};

export const isoToLocalTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};
