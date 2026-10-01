import React, { useRef, useMemo, useState } from 'react';
import { NoteItem } from '../types';
import { resolveWikilink } from '../utils/markdownParser';

interface WikilinkRendererProps {
  content: string;
  allNotes: NoteItem[];
  onSelectNote: (slug: string) => void;
  onHoverLink: (note: NoteItem | null, pos: { top: number; left: number }) => void;
}

export const WikilinkRenderer: React.FC<WikilinkRendererProps> = React.memo(({
  content,
  allNotes,
  onSelectNote,
  onHoverLink,
}) => {
  const hoverTimerRef = useRef<any>(null);
  const lastTapRef = useRef<{ target: string; time: number }>({ target: '', time: 0 });

  // Handle desktop hover preview
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, targetText: string) => {
    // Only trigger hover on non-touch devices
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const resolved = resolveWikilink(targetText, allNotes);

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      onHoverLink(resolved || null, {
        top: rect.bottom,
        left: rect.left,
      });
    }, 120);
  };

  const handleMouseLeave = () => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      onHoverLink(null, { top: 0, left: 0 });
    }, 250);
  };

  // Handle click & mobile touch interaction
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetText: string) => {
    e.preventDefault();
    const resolved = resolveWikilink(targetText, allNotes);
    if (!resolved) return;

    const isTouchDevice = (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      window.innerWidth < 992
    );

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;
    const isSameTarget = lastTapRef.current.target === targetText;

    if (isTouchDevice) {
      // Mobile behavior:
      // First tap shows preview card.
      // Double tap (within 500ms on same link) navigates immediately!
      if (isSameTarget && timeSinceLastTap < 500) {
        // Double tap confirmed -> navigate
        lastTapRef.current = { target: '', time: 0 };
        onHoverLink(null, { top: 0, left: 0 });
        onSelectNote(resolved.slug);
      } else {
        // First tap -> show preview popup
        lastTapRef.current = { target: targetText, time: now };
        const rect = e.currentTarget.getBoundingClientRect();
        onHoverLink(resolved, {
          top: rect.bottom,
          left: rect.left,
        });
      }
    } else {
      // Desktop: single click navigates directly
      onHoverLink(null, { top: 0, left: 0 });
      onSelectNote(resolved.slug);
    }
  };

  /**
   * Replaces [[Wikilinks]] inside text with interactive clickable elements
   */
  const renderInlineTextWithWikilinks = (text: string): React.ReactNode[] => {
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = wikilinkRegex.exec(text)) !== null) {
      const startIndex = match.index;
      const fullMatch = match[0];
      const target = match[1].trim();
      const alias = match[2]?.trim() || target;

      if (startIndex > lastIndex) {
        elements.push(renderFormatting(text.slice(lastIndex, startIndex), `${lastIndex}`));
      }

      const resolved = resolveWikilink(target, allNotes);

      elements.push(
        <a
          key={`wikilink-${startIndex}`}
          href={`#${resolved ? resolved.slug : target}`}
          className={`wikilink-badge ${!resolved ? 'wikilink-missing' : ''}`}
          title={resolved ? `Buka artikel: ${resolved.frontmatter.title} (klik 2x di HP untuk langsung buka)` : `Artikel belum tersedia: ${target}`}
          onClick={(e) => handleLinkClick(e, target)}
          onMouseEnter={(e) => handleMouseEnter(e, target)}
          onMouseLeave={handleMouseLeave}
        >
          <span>{alias}</span>
        </a>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      elements.push(renderFormatting(text.slice(lastIndex), `${lastIndex}`));
    }

    return elements;
  };

  /**
   * Helper for bold, italic, code formatting
   */
  const renderFormatting = (text: string, keyPrefix: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`)/);
    return (
      <React.Fragment key={keyPrefix}>
        {parts.map((part, i) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code
                key={`${keyPrefix}-code-${i}`}
                className="px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--wiki-font-mono)',
                  fontSize: '0.88em',
                  backgroundColor: 'var(--wiki-badge-bg)',
                  color: 'var(--wiki-wikilink-color)',
                }}
              >
                {part.slice(1, -1)}
              </code>
            );
          }

          const boldParts = part.split(/(\*\*[^*]+\*\*)/);
          return boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return (
                <strong key={`${keyPrefix}-b-${bIdx}`} className="fw-semibold">
                  {bPart.slice(2, -2)}
                </strong>
              );
            }

            const italicParts = bPart.split(/(\*[^*]+\*)/);
            return italicParts.map((itPart, itIdx) => {
              if (itPart.startsWith('*') && itPart.endsWith('*')) {
                return <em key={`${keyPrefix}-it-${itIdx}`}>{itPart.slice(1, -1)}</em>;
              }

              // Standard markdown link: [text](url)
              const linkParts = itPart.split(/(\[[^\]]+\]\([^)]+\))/);
              return linkParts.map((lPart, lIdx) => {
                const linkMatch = lPart.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (linkMatch) {
                  return (
                    <a
                      key={`${keyPrefix}-link-${lIdx}`}
                      href={linkMatch[2]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-underline"
                    >
                      {linkMatch[1]}
                    </a>
                  );
                }
                return lPart;
              });
            });
          });
        })}
      </React.Fragment>
    );
  };

  /**
   * Parses markdown blocks (headers, callouts, tables, lists, images, paragraphs)
   * GUARANTEES PROGRESS ON EVERY ITERATION: can NEVER get stuck or freeze Chrome!
   */
  const parseBlocks = (raw: string): React.ReactNode[] => {
    const lines = raw.split(/\r?\n/);
    const blocks: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // 2. Image Block: ![alt](url)
      const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const altText = imageMatch[1];
        const srcUrl = imageMatch[2];
        blocks.push(
          <figure key={`img-${i}`} className="my-4 text-center">
            <div
              className="d-inline-block rounded-3 overflow-hidden border shadow-sm p-2.5"
              style={{
                maxWidth: '100%',
                backgroundColor: 'var(--wiki-card-bg)',
                borderColor: 'var(--wiki-card-border)',
              }}
            >
              <img
                src={srcUrl}
                alt={altText}
                className="img-fluid rounded"
                style={{ maxHeight: '280px', objectFit: 'contain' }}
                loading="lazy"
              />
            </div>
            {altText && (
              <figcaption className="text-muted small mt-2 fst-italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }

      // 3. Horizontal Rule
      if (/^---|\*\*\*|___$/.test(line.trim())) {
        blocks.push(
          <hr
            key={`hr-${i}`}
            className="my-4"
            style={{ borderColor: 'var(--wiki-border)', opacity: 0.7 }}
          />
        );
        i++;
        continue;
      }

      // 4. Editorial Callout: > [!NOTE], > [!TIP], etc.
      const calloutMatch = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)$/);
      if (calloutMatch) {
        const calloutType = calloutMatch[1].toLowerCase();
        const calloutCustomTitle = calloutMatch[2].trim();
        const calloutLines: string[] = [];
        i++; // advance past header

        while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
          if (lines[i].startsWith('>')) {
            calloutLines.push(lines[i].replace(/^>\s?/, ''));
          } else {
            calloutLines.push('');
          }
          i++;
        }

        const calloutIcons: Record<string, string> = {
          note: 'bi-info-circle text-primary',
          info: 'bi-lightbulb text-info',
          tip: 'bi-check-circle text-success',
          warning: 'bi-exclamation-triangle text-warning',
          quote: 'bi-quote text-secondary',
        };

        const calloutClass = `classic-callout classic-callout-${calloutType}`;
        const iconClass = calloutIcons[calloutType] || 'bi-info-circle text-primary';

        blocks.push(
          <div key={`callout-${i}`} className={calloutClass}>
            <div className="classic-callout-title">
              <i className={`bi ${iconClass}`}></i>
              <span>{calloutCustomTitle || calloutType}</span>
            </div>
            <div>
              {calloutLines.map((cLine, cIdx) => (
                <p key={cIdx} className="mb-1 text-secondary">
                  {renderInlineTextWithWikilinks(cLine)}
                </p>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // 5. Standard Blockquote
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        blocks.push(
          <blockquote
            key={`quote-${i}`}
            className="border-start border-3 ps-3 py-1 my-3 rounded-end fst-italic text-secondary"
            style={{
              borderColor: 'var(--wiki-border)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {quoteLines.map((q, qIdx) => (
              <p key={qIdx} className="mb-0">
                {renderInlineTextWithWikilinks(q)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 6. Headings (#, ##, ###, ####)
      const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].trim();
        const cleanText = text.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1').replace(/[*_`]/g, '');
        const id = cleanText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        if (level === 1) {
          blocks.push(
            <h1 key={`h1-${i}`} id={id} className="scroll-mt-5">
              {renderInlineTextWithWikilinks(text)}
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2 key={`h2-${i}`} id={id} className="scroll-mt-5 border-bottom pb-2 pt-3" style={{ borderColor: 'var(--wiki-border)' }}>
              {renderInlineTextWithWikilinks(text)}
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3 key={`h3-${i}`} id={id} className="scroll-mt-5 pt-2">
              {renderInlineTextWithWikilinks(text)}
            </h3>
          );
        } else {
          blocks.push(
            <h4 key={`h4-${i}`} id={id} className="fw-semibold text-secondary pt-2">
              {renderInlineTextWithWikilinks(text)}
            </h4>
          );
        }
        i++;
        continue;
      }

      // 7. Markdown Table (header row with pipes, followed by separator row)
      if (line.includes('|') && lines[i + 1]?.includes('|') && /^\s*\|?\s*:?-+:?\s*\|/.test(lines[i + 1])) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
          const dataRows = tableLines.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));

          blocks.push(
            <div key={`table-${i}`} className="markdown-table-wrapper">
              <table className="markdown-table">
                <thead>
                  <tr>
                    {headerRow.map((h, hIdx) => (
                      <th key={hIdx}>{renderInlineTextWithWikilinks(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{renderInlineTextWithWikilinks(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 8. Unordered or Ordered List
      if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        const listItems: string[] = [];
        const isOrdered = /^\d+\.\s+/.test(line);

        while (
          i < lines.length &&
          ((!isOrdered && /^[-*]\s+/.test(lines[i])) || (isOrdered && /^\d+\.\s+/.test(lines[i])))
        ) {
          const itemText = isOrdered
            ? lines[i].replace(/^\d+\.\s+/, '')
            : lines[i].replace(/^[-*]\s+/, '');
          listItems.push(itemText);
          i++;
        }

        if (listItems.length > 0) {
          if (isOrdered) {
            blocks.push(
              <ol key={`ol-${i}`}>
                {listItems.map((item, idx) => (
                  <li key={idx} className="mb-1.5">
                    {renderInlineTextWithWikilinks(item)}
                  </li>
                ))}
              </ol>
            );
          } else {
            blocks.push(
              <ul key={`ul-${i}`}>
                {listItems.map((item, idx) => (
                  <li key={idx} className="mb-1.5">
                    {renderInlineTextWithWikilinks(item)}
                  </li>
                ))}
              </ul>
            );
          }
          continue;
        }
      }

      // 9. Regular Paragraph (Takes all contiguous non-block lines and GUARANTEES i++ progress)
      const pLines: string[] = [];
      while (i < lines.length) {
        const curr = lines[i];
        if (!curr.trim()) break;
        if (curr.startsWith('#') || curr.startsWith('>') || /^---|\*\*\*|___$/.test(curr.trim()) || curr.trim().startsWith('![')) break;
        if (/^[-*]\s+/.test(curr) || /^\d+\.\s+/.test(curr)) break;
        // Stop if a valid table starts
        if (curr.includes('|') && lines[i + 1]?.includes('|') && /^\s*\|?\s*:?-+:?\s*\|/.test(lines[i + 1])) break;

        pLines.push(curr);
        i++;
      }

      if (pLines.length > 0) {
        blocks.push(
          <p key={`p-${i}`} className="mb-3" style={{ lineHeight: '1.7' }}>
            {renderInlineTextWithWikilinks(pLines.join(' '))}
          </p>
        );
      } else {
        // Progress guarantee: if nothing consumed, force increment i so loop NEVER hangs!
        i++;
      }
    }

    return blocks;
  };

  const renderedBlocks = useMemo(() => {
    return parseBlocks(content);
  }, [content, allNotes]);

  return <div className="markdown-body">{renderedBlocks}</div>;
});
