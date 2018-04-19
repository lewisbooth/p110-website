exports.truncate = (string, length) => {
  if (!string) return ""
  let truncated = string.substring(0, length)
  if (truncated.endsWith(" ")) {
    truncated = truncated.split("").slice(0, length - 1).join("")
  }
  if (truncated.length >= length - 1) { truncated += "..." }
  return truncated
}