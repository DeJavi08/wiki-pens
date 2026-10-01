import React from 'react';
import { NoteItem } from '../types';

interface HoverPreviewCardProps {
  note: NoteItem | null;
  position: { top: number; left: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelectNote: (slug: string) => void;
  onClose?: () => void;
}

export const HoverPreviewCard: React.FC<HoverPreviewCardProps> = ({
  note,
  position,
  onMouseEnter,
  onMouseLeave,
  onSelectNote,
  onClose,
}) => {
  if (!note) return null;

  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0)
  );

  // Responsive fixed position calculations
  const cardWidth = isMobile ? Math.min(window.innerWidth - 32, 340) : 320;
  let top = position.top + 8;
  let left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, position.left - 20));

  // If card overflows bottom of viewport, place it above the link instead
  if (top + 220 > window.innerHeight) {
    top = Math.max(60, position.top - 210);
  }

  return (
    <>
      {/* Mobile backdrop to easily dismiss */}
      {isMobile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1079, backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
            else onMouseLeave();
          }}
        />
      )}

      <div
        className="hover-preview-card p-3 shadow-lg"
        style={{
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${cardWidth}px`,
          zIndex: 1080,
          backgroundColor: 'var(--wiki-card-bg)',
          borderColor: 'var(--wiki-border)',
          cursor: 'pointer',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => onSelectNote(note.slug)}
      >
        {/* Header Badge & Close Button */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span
            className="badge px-2 py-0.5 rounded fw-medium"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              color: 'var(--wiki-wikilink-color)',
              fontSize: '0.72rem',
            }}
          >
            {note.frontmatter.category}
          </span>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
              ~{note.readingTimeMinutes} min baca
            </span>
            {isMobile && (
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-muted"
                style={{ fontSize: '1rem', lineHeight: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClose) onClose();
                  else onMouseLeave();
                }}
                aria-label="Tutup Pratinjau"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h6
          className="fw-bold mb-1.5 text-truncate"
          style={{ fontSize: '0.94rem', color: 'var(--wiki-text-primary)' }}
        >
          {note.frontmatter.title}
        </h6>

        {/* Summary Snippet */}
        <p
          className="small mb-2.5"
          style={{
            fontSize: '0.8rem',
            lineHeight: '1.45',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--wiki-text-secondary)',
          }}
        >
          {note.frontmatter.summary}
        </p>

        {/* Footer Action */}
        <div
          className="d-flex align-items-center justify-content-between pt-2 border-top"
          style={{ borderColor: 'var(--wiki-border)', fontSize: '0.72rem' }}
        >
          <span className="text-muted">
            {note.outboundLinks.length} tautan keluar &bull; {note.backlinks.length} perujuk
          </span>
          <span className="fw-semibold text-primary d-inline-flex align-items-center gap-1">
            <span>Buka Artikel</span>
            <i className="bi bi-arrow-right"></i>
          </span>
        </div>

        {isMobile && (
          <div
            className="text-center mt-2 pt-1 border-top text-muted"
            style={{ fontSize: '0.66rem', borderColor: 'var(--wiki-border)' }}
          >
            <i className="bi bi-hand-index-thumb me-1"></i>
            Ketuk sekali lagi atau sentuh kartu ini untuk membuka
          </div>
        )}
      </div>
    </>
  );
};
