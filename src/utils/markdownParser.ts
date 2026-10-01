import { NoteFrontmatter, NoteHeading, NoteItem, BacklinkMention, GraphNode, GraphEdge } from '../types';

/**
 * Cleanly parses YAML frontmatter without requiring bulky node.js polyfills
 */
export function parseFrontmatter(rawContent: string): { frontmatter: NoteFrontmatter; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {
        title: 'Untitled Note',
        slug: 'untitled',
        category: 'Umum',
        tags: [],
        updated: new Date().toISOString().split('T')[0],
        summary: rawContent.slice(0, 150).replace(/[#*`[\]]/g, '').trim() + '...',
      },
      content: rawContent,
    };
  }

  const yamlBlock = match[1];
  const markdownBody = match[2];

  const parsed: Partial<NoteFrontmatter> = {};
  const lines = yamlBlock.split(/\r?\n/);

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (key === 'tags' || key === 'aliases') {
      if (val.startsWith('[') && val.endsWith(']')) {
        const rawItems = val.slice(1, -1).split(',');
        parsed[key] = rawItems
          .map(item => item.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        parsed[key] = [];
      }
    } else if (key === 'featured') {
      parsed.featured = val.toLowerCase() === 'true';
    } else {
      (parsed as Record<string, any>)[key] = val;
    }
  }

  const defaultTitle = 'Catatan PENS';
  let cat = parsed.category || 'Umum';
  let subcat = parsed.subcategory;
  if (cat.includes('/') && !subcat) {
    const parts = cat.split('/');
    cat = parts[0].trim();
    subcat = parts.slice(1).join('/').trim();
  }

  const frontmatter: NoteFrontmatter = {
    title: parsed.title || defaultTitle,
    slug: parsed.slug || parsed.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'note',
    category: cat,
    subcategory: subcat,
    tags: parsed.tags || [],
    aliases: parsed.aliases || [],
    updated: parsed.updated || new Date().toISOString().split('T')[0],
    summary: parsed.summary || markdownBody.slice(0, 150).replace(/[#*`[\]]/g, '').trim() + '...',
    author: parsed.author || 'Tim Ensiklopedia PENS',
    icon: parsed.icon || 'bi-file-earmark-text',
    banner: parsed.banner,
    featured: parsed.featured || false,
  };

  return { frontmatter, content: markdownBody };
}

/**
 * Extracts headings from markdown content
 */
export function extractHeadings(markdown: string): NoteHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: NoteHeading[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Remove inline links or bolding for heading text
      const cleanText = rawText.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1').replace(/[*_`]/g, '');
      const id = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      headings.push({ id, text: cleanText, level });
    }
  }

  return headings;
}

/**
 * Normalizes text for target matching
 */
export function normalizeForSearch(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts context snippet surrounding a search term or target name
 */
export function extractSnippet(content: string, targetName: string): string {
  const lowerContent = content.toLowerCase();
  const lowerTarget = targetName.toLowerCase();
  let idx = lowerContent.indexOf(lowerTarget);

  if (idx === -1) {
    // Try matching inside [[target]]
    idx = lowerContent.indexOf(`[[${lowerTarget}`);
  }

  if (idx === -1) {
    return content.slice(0, 120).replace(/[#*`]/g, '').trim() + '...';
  }

  const start = Math.max(0, idx - 45);
  const end = Math.min(content.length, idx + targetName.length + 65);
  let snippet = content.slice(start, end).replace(/\r?\n/g, ' ').replace(/[#*`]/g, '');

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Fast O(1) cache for Wikilink resolution across all notes
 */
let cachedIndexNotesRef: NoteItem[] | null = null;
let cachedSlugMap = new Map<string, NoteItem>();
let cachedTitleMap = new Map<string, NoteItem>();
let cachedAliasMap = new Map<string, NoteItem>();
let cachedAllList: NoteItem[] = [];

function getIndexMaps(notesList: NoteItem[]) {
  if (cachedIndexNotesRef === notesList && cachedAllList.length === notesList.length) {
    return { slugMap: cachedSlugMap, titleMap: cachedTitleMap, aliasMap: cachedAliasMap, list: cachedAllList };
  }
  cachedIndexNotesRef = notesList;
  cachedAllList = notesList;
  cachedSlugMap = new Map();
  cachedTitleMap = new Map();
  cachedAliasMap = new Map();

  for (const n of notesList) {
    cachedSlugMap.set(normalizeForSearch(n.slug), n);
    cachedTitleMap.set(normalizeForSearch(n.frontmatter.title), n);
    if (n.frontmatter.aliases) {
      for (const a of n.frontmatter.aliases) {
        cachedAliasMap.set(normalizeForSearch(a), n);
      }
    }
  }
  return { slugMap: cachedSlugMap, titleMap: cachedTitleMap, aliasMap: cachedAliasMap, list: cachedAllList };
}

/**
 * Resolves a Wikilink target text to a concrete note with O(1) cached lookup
 */
export function resolveWikilink(
  targetText: string,
  notesList: NoteItem[]
): NoteItem | undefined {
  if (!targetText) return undefined;
  const norm = normalizeForSearch(targetText);
  const { slugMap, titleMap, aliasMap, list } = getIndexMaps(notesList);

  // 1. Direct slug match
  let found = slugMap.get(norm);
  if (found) return found;

  // 2. Direct title match
  found = titleMap.get(norm);
  if (found) return found;

  // 3. Aliases match
  found = aliasMap.get(norm);
  if (found) return found;

  // 4. StartsWith or Contains fallback
  found = list.find(n => {
    const tNorm = normalizeForSearch(n.frontmatter.title);
    return tNorm.includes(norm) || norm.includes(tNorm);
  });

  return found;
}

/**
 * Indexes raw markdown files into fully parsed NoteItems with bidirectional backlinks
 */
export function loadAllNotes(): NoteItem[] {
  // Vite import.meta.glob to load all notes in src/content/notes/
  const rawModules = import.meta.glob<string>('/src/content/notes/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  const tempNotes: Array<{
    filePath: string;
    frontmatter: NoteFrontmatter;
    rawMarkdown: string;
    content: string;
    headings: NoteHeading[];
    wordCount: number;
    readingTimeMinutes: number;
  }> = [];

  for (const [filePath, rawMarkdown] of Object.entries(rawModules)) {
    const { frontmatter, content } = parseFrontmatter(rawMarkdown);
    const headings = extractHeadings(content);
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 180));

    tempNotes.push({
      filePath,
      frontmatter,
      rawMarkdown,
      content,
      headings,
      wordCount: words,
      readingTimeMinutes,
    });
  }

  // First pass: create initial NoteItems map
  const notesMap = new Map<string, NoteItem>();

  for (const n of tempNotes) {
    notesMap.set(n.frontmatter.slug, {
      ...n,
      slug: n.frontmatter.slug,
      outboundLinks: [],
      backlinks: [],
    });
  }

  const allNotes = Array.from(notesMap.values());
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

  // Second pass: extract outbound links
  for (const note of allNotes) {
    const outboundSlugs = new Set<string>();
    let match: RegExpExecArray | null;
    wikilinkRegex.lastIndex = 0;

    while ((match = wikilinkRegex.exec(note.content)) !== null) {
      const rawTarget = match[1].trim();
      const resolved = resolveWikilink(rawTarget, allNotes);
      if (resolved && resolved.slug !== note.slug) {
        outboundSlugs.add(resolved.slug);
      }
    }

    note.outboundLinks = Array.from(outboundSlugs);
  }

  // Third pass: index backlinks
  for (const sourceNote of allNotes) {
    for (const targetSlug of sourceNote.outboundLinks) {
      const targetNote = notesMap.get(targetSlug);
      if (targetNote) {
        // Check if backlink already recorded from this source
        if (!targetNote.backlinks.some(b => b.sourceSlug === sourceNote.slug)) {
          const snippet = extractSnippet(sourceNote.content, targetNote.frontmatter.title);
          targetNote.backlinks.push({
            sourceSlug: sourceNote.slug,
            sourceTitle: sourceNote.frontmatter.title,
            sourceCategory: sourceNote.frontmatter.category,
            sourceIcon: sourceNote.frontmatter.icon,
            snippet,
          });
        }
      }
    }
  }

  return allNotes;
}

/**
 * Builds nodes and edges for local or global graph views
 */
export function buildGraphData(
  allNotes: NoteItem[],
  currentSlug?: string,
  isGlobal = false
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (isGlobal || !currentSlug) {
    const nodes: GraphNode[] = allNotes.map(n => ({
      id: n.slug,
      title: n.frontmatter.title,
      category: n.frontmatter.category,
      isCurrent: n.slug === currentSlug,
      linkCount: n.outboundLinks.length + n.backlinks.length,
    }));

    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    for (const note of allNotes) {
      for (const outSlug of note.outboundLinks) {
        const edgeKey = [note.slug, outSlug].sort().join('--');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({ source: note.slug, target: outSlug });
        }
      }
    }

    return { nodes, edges };
  }

  // Local graph for current note
  const currentNote = allNotes.find(n => n.slug === currentSlug);
  if (!currentNote) return { nodes: [], edges: [] };

  const connectedSlugs = new Set<string>([currentSlug]);
  currentNote.outboundLinks.forEach(s => connectedSlugs.add(s));
  currentNote.backlinks.forEach(b => connectedSlugs.add(b.sourceSlug));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const slug of connectedSlugs) {
    const n = allNotes.find(item => item.slug === slug);
    if (n) {
      nodes.push({
        id: n.slug,
        title: n.frontmatter.title,
        category: n.frontmatter.category,
        isCurrent: n.slug === currentSlug,
        linkCount: n.outboundLinks.length + n.backlinks.length,
      });
    }
  }

  // Connect all nodes within the local neighborhood (including neighbor-to-neighbor links)
  for (const sSlug of connectedSlugs) {
    const sNote = allNotes.find(item => item.slug === sSlug);
    if (!sNote) continue;
    for (const outSlug of sNote.outboundLinks) {
      if (connectedSlugs.has(outSlug)) {
        const key = [sSlug, outSlug].sort().join('--');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: sSlug, target: outSlug });
        }
      }
    }
  }

  return { nodes, edges };
}

/**
 * Generate academic citations in APA, IEEE, and BibTeX formats
 */
export function generateCitation(note: NoteItem, format: 'apa' | 'ieee' | 'bibtex'): string {
  const currentYear = new Date(note.frontmatter.updated).getFullYear() || 2026;
  const title = note.frontmatter.title;
  const author = note.frontmatter.author || 'Ensiklopedia Terbuka PENS';
  const url = `https://wiki.pens.ac.id/notes/${note.slug}`;
  const dateStr = note.frontmatter.updated;

  switch (format) {
    case 'apa':
      return `${author}. (${currentYear}). ${title}. PENS Wiki: Ensiklopedia Politeknik Elektronika Negeri Surabaya. Diakses dari ${url}`;
    case 'ieee':
      return `[1] ${author}, "${title}," PENS Wiki - Knowledge Base EEPIS, ${dateStr}. [Online]. Available: ${url}.`;
    case 'bibtex':
      return `@online{penswiki_${note.slug.replace(/-/g, '_')},\n  author = {${author}},\n  title = {${title}},\n  year = {${currentYear}},\n  url = {${url}},\n  urldate = {${dateStr}}\n}`;
  }
}
