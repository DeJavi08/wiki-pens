export interface NoteFrontmatter {
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  tags: string[];
  aliases?: string[];
  updated: string;
  summary: string;
  author?: string;
  icon?: string;
  banner?: string;
  featured?: boolean;
}

export interface NoteHeading {
  id: string;
  text: string;
  level: number;
}

export interface WikilinkMatch {
  raw: string;
  target: string;
  displayText: string;
}

export interface BacklinkMention {
  sourceSlug: string;
  sourceTitle: string;
  sourceCategory: string;
  sourceIcon?: string;
  snippet: string;
}

export interface NoteItem {
  slug: string;
  filePath: string;
  frontmatter: NoteFrontmatter;
  rawMarkdown: string;
  content: string; // Markdown without frontmatter
  headings: NoteHeading[];
  outboundLinks: string[]; // slugs
  backlinks: BacklinkMention[];
  wordCount: number;
  readingTimeMinutes: number;
}

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  isCurrent: boolean;
  linkCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}
