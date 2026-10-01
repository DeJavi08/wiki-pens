import React, { useEffect, useState } from 'react';
import { NoteHeading, NoteItem } from '../types';

interface TableOfContentsProps {
  headings: NoteHeading[];
  currentNote: NoteItem;
  onOpenCitation: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  currentNote,
  onOpenCitation,
}) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map(h => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          return;
        }
      }

      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="table-of-contents sticky-top" style={{ top: '75px', zIndex: 10 }}>
      {/* Article Metadata Card (Classic Editorial Style) */}
      <div
        className="card border mb-3 p-3 shadow-none"
        style={{
          backgroundColor: 'var(--wiki-card-bg)',
          borderColor: 'var(--wiki-border)',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Informasi Artikel
          </span>
          <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
            {currentNote.wordCount} Kata
          </span>
        </div>

        <div className="small text-muted mb-2.5" style={{ fontSize: '0.75rem', lineHeight: '1.65' }}>
          <div>
            <span style={{ color: 'var(--wiki-text-secondary)' }}>Pembaruan:</span>{' '}
            <strong style={{ color: 'var(--wiki-text-primary)' }}>{currentNote.frontmatter.updated}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--wiki-text-secondary)' }}>Waktu Baca:</span> ~{currentNote.readingTimeMinutes} menit
          </div>
          <div>
            <span style={{ color: 'var(--wiki-text-secondary)' }}>Tautan:</span> {currentNote.outboundLinks.length} keluar &bull; {currentNote.backlinks.length} masuk
          </div>
        </div>

        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1.5"
          style={{
            fontSize: '0.75rem',
            padding: '5px 10px',
            backgroundColor: 'var(--wiki-sidebar-bg)',
            borderColor: 'var(--wiki-border)',
            color: 'var(--wiki-text-primary)',
          }}
          onClick={onOpenCitation}
        >
          <i className="bi bi-quote"></i>
          <span>Salin Sitasi (APA / IEEE)</span>
        </button>
      </div>

      {/* Headings Outline (TOC) */}
      <div
        className="card border p-3 shadow-none"
        style={{
          backgroundColor: 'var(--wiki-card-bg)',
          borderColor: 'var(--wiki-border)',
          maxHeight: 'calc(100vh - 360px)',
          overflowY: 'auto',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: 'var(--wiki-border)' }}>
          <span className="text-uppercase fw-semibold text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Daftar Isi
          </span>
          <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
            {headings.length} Bagian
          </span>
        </div>

        {headings.length === 0 ? (
          <div className="text-muted small py-2 fst-italic" style={{ fontSize: '0.75rem' }}>
            Tidak ada sub-judul.
          </div>
        ) : (
          <nav className="nav flex-column gap-1">
            {headings.map((h, idx) => {
              const isActive = activeId === h.id;
              const indent = h.level === 1 ? 0 : h.level === 2 ? 8 : 16;

              return (
                <a
                  key={idx}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(h.id);
                  }}
                  className={`nav-link p-1 text-truncate text-decoration-none rounded transition ${
                    isActive ? 'fw-semibold' : ''
                  }`}
                  style={{
                    fontSize: h.level === 1 ? '0.8rem' : '0.75rem',
                    paddingLeft: `${indent + 6}px`,
                    color: isActive ? 'var(--wiki-wikilink-color)' : 'var(--wiki-text-secondary)',
                    backgroundColor: isActive ? 'var(--wiki-wikilink-bg)' : 'transparent',
                    borderLeft: isActive ? '2.5px solid var(--wiki-wikilink-color)' : '2.5px solid transparent',
                    lineHeight: '1.45',
                  }}
                  title={h.text}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};
