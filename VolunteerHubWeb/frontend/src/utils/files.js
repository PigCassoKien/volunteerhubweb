export const getFileUrl = (fileName) => {
  if (!fileName) return "/images/default-event.jpg";
  // remove trailing slash from base to avoid double slashes
  const base = (import.meta.env.VITE_UPLOAD_BASE || "/uploads").replace(/\/$/, "");
  // encode each path segment (preserve '/')
  const safe = fileName
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base}/${safe}`;
};