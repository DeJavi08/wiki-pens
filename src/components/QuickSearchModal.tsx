import React, { useState, useEffect, useRef } from 'react';
import { NoteItem } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allNotes: NoteItem[];
  onSelectNote: (slug: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  allNotes,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredNotes = React.useMemo(() => {
    if (!query.trim()) {
      return allNotes.filter(n => n.frontmatter.featured).slice(0, 7);
    }

    const q = query.toLowerCase();
    return allNotes
      .filter(n => {
        return (
          n.frontmatter.title.toLowerCase().includes(q) ||
          n.frontmatter.summary.toLowerCase().includes(q) ||
          n.frontmatter.category.toLowerCase().includes(q) ||
          n.frontmatter.tags?.some(t => t.toLowerCase().includes(q)) ||
          n.frontmatter.aliases?.some(a => a.toLowerCase().includes(q))
        );
      })
      .slice(0, 10);
  }, [allNotes, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredNotes.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredNotes.length) % Math.max(1, filteredNotes.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNotes[selectedIndex]) {
        onSelectNote(filteredNotes[selectedIndex].slug);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered px-2 px-sm-0"
        style={{ maxWidth: '600px', width: '100%', margin: '0.75rem auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border shadow-sm"
          style={{
            backgroundColor: 'var(--wiki-card-bg)',
            borderColor: 'var(--wiki-border)',
            color: 'var(--wiki-text-primary)',
            borderRadius: '8px',
          }}
        >
          {/* Search Input Bar */}
          <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--wiki-border)' }}>
            <i className="bi bi-search text-muted fs-6"></i>
            <input
              ref={inputRef}
              type="text"
              className="form-control bg-transparent border-0 shadow-none ps-1"
              placeholder="Cari artikel, topik, atau kata kunci..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              style={{
                fontSize: '0.95rem',
                outline: 'none',
                color: 'var(--wiki-text-primary)',
              }}
            />
            <span
              className="badge border small px-2 py-1"
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'var(--wiki-sidebar-bg)',
                color: 'var(--wiki-text-muted)',
                borderColor: 'var(--wiki-border)',
              }}
            >
              ESC
            </span>
          </div>

          {/* Results List */}
          <div className="p-2 overflow-y-auto" style={{ maxHeight: '380px' }}>
            <div className="px-2 py-1 text-uppercase small fw-semibold" style={{ fontSize: '0.67rem', letterSpacing: '0.04em', color: 'var(--wiki-text-muted)' }}>
              {query.trim() ? `Hasil Pencarian (${filteredNotes.length})` : 'Artikel Pilihan'}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0 small">Tidak ditemukan catatan yang cocok dengan "{query}".</p>
              </div>
            ) : (
              filteredNotes.map((note, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={note.slug}
                    className="d-flex align-items-start gap-2.5 p-2 rounded transition"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--wiki-sidebar-bg)' : 'transparent',
                      borderLeft: isSelected ? '2px solid var(--wiki-wikilink-color)' : '2px solid transparent',
                    }}
                    onClick={() => {
                      onSelectNote(note.slug);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center justify-content-between mb-0.5">
                        <span className="fw-semibold text-truncate" style={{ fontSize: '0.88rem', color: 'var(--wiki-text-primary)' }}>
                          {note.frontmatter.title}
                        </span>
                        <span
                          className="badge border small"
                          style={{
                            fontSize: '0.67rem',
                            backgroundColor: 'var(--wiki-sidebar-bg)',
                            color: 'var(--wiki-text-muted)',
                            borderColor: 'var(--wiki-border)',
                          }}
                        >
                          {note.frontmatter.category}
                        </span>
                      </div>
                      <p
                        className="small mb-0 text-truncate"
                        style={{ fontSize: '0.78rem', color: 'var(--wiki-text-secondary)' }}
                      >
                        {note.frontmatter.summary}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div
            className="p-2 px-3 border-top d-flex align-items-center justify-content-between small text-muted"
            style={{ backgroundColor: 'var(--wiki-sidebar-bg)', borderColor: 'var(--wiki-border)', fontSize: '0.72rem' }}
          >
            <span>
              Gunakan tanda panah <kbd className="border px-1 rounded" style={{ backgroundColor: 'var(--wiki-card-bg)', color: 'var(--wiki-text-primary)' }}>↑</kbd> <kbd className="border px-1 rounded" style={{ backgroundColor: 'var(--wiki-card-bg)', color: 'var(--wiki-text-primary)' }}>↓</kbd> lalu <kbd className="border px-1 rounded" style={{ backgroundColor: 'var(--wiki-card-bg)', color: 'var(--wiki-text-primary)' }}>Enter</kbd>
            </span>
            <span>{allNotes.length} artikel terindeks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
