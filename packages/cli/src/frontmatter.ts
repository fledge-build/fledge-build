import { parse, stringify } from 'yaml'

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?\n)---/m
const NEWLINE_PATTERN = /^\n+/

/**
 * Parses YAML frontmatter from a markdown string.
 *
 * If no frontmatter block is found, returns an empty object.
 *
 * @param content - The full markdown string including the frontmatter block.
 * @returns The parsed frontmatter data as `T`.
 */
export function parseFrontmatter<T = Record<string, unknown>>(content: string): T {
  const match = content.match(FRONTMATTER_PATTERN)
  if (!match) {
    return {} as T
  }
  return parse(match[1]!) as T
}

/**
 * Writes YAML frontmatter into a markdown string.
 *
 * If the content already contains a frontmatter block, it is replaced.
 * Otherwise the frontmatter is prepended to the content.
 *
 * @param data - The frontmatter data to serialize as YAML.
 * @param content - The full markdown string to write the frontmatter into. Defaults to an empty string.
 * @returns The complete markdown string with the frontmatter block at the top.
 */
export function writeFrontmatter(data: Record<string, unknown>, content: string = ''): string {
  const yamlString = stringify(data, { lineWidth: 0 }).trimEnd()
  const withoutFrontmatter = content.replace(FRONTMATTER_PATTERN, '').replace(NEWLINE_PATTERN, '')
  const parts = ['---', yamlString, '---']
  if (withoutFrontmatter) {
    parts.push('', withoutFrontmatter)
  }
  return `${parts.join('\n')}\n`
}
