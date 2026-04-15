export function getErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (Array.isArray(data?.details) && data.details.length > 0) {
    return data.details[0];
  }

  return data?.message || error?.message || fallback;
}
