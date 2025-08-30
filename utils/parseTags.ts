export function parseTags(input: string): string[] {
  return input
    .split(/\s+/)
    .map((tag) => tag.replace(/^#/, ""))
    .filter(Boolean);
}
