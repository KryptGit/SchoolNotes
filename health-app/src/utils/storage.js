export const read = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const remove = (key) => {
  localStorage.removeItem(key);
};
