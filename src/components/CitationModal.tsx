import React, { useState } from 'react';
import { NoteItem } from '../types';
import { generateCitation } from '../utils/markdownParser';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: NoteItem;
}

export const CitationModal: React.FC<CitationModalProps> = ({ isOpen, onClose, note }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const apa = generateCitation(note, 'apa');
  const ieee = generateCitation(note, 'ieee');
  const bibtex = generateCitation(note, 'bibtex');

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1090 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered px-2 px-sm-0"
        style={{ margin: '0.75rem auto' }}
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
          <div className="modal-header border-bottom py-2.5 px-4" style={{ borderColor: 'var(--wiki-border)' }}>
            <div>
              <h6 className="modal-title fw-bold m-0" style={{ color: 'var(--wiki-text-primary)' }}>Salin Sitasi Artikel</h6>
              <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                Format rujukan untuk makalah, laporan akademik, atau tugas akhir
              </span>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* APA Format */}
            <div className="mb-3.5">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-semibold small" style={{ fontSize: '0.75rem', color: 'var(--wiki-text-secondary)' }}>
                  Format APA (7th Edition)
                </span>
                <button
                  className={`btn btn-sm ${copiedFormat === 'apa' ? 'btn-success' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  onClick={() => copyToClipboard(apa, 'apa')}
                >
                  <i className={`bi ${copiedFormat === 'apa' ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                  {copiedFormat === 'apa' ? 'Tersalin' : 'Salin'}
                </button>
              </div>
              <div
                className="p-2.5 rounded border small"
                style={{
                  borderColor: 'var(--wiki-border)',
                  backgroundColor: 'var(--wiki-sidebar-bg)',
                  color: 'var(--wiki-text-primary)',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                }}
              >
                {apa}
              </div>
            </div>

            {/* IEEE Format */}
            <div className="mb-3.5">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-semibold small" style={{ fontSize: '0.75rem', color: 'var(--wiki-text-secondary)' }}>
                  Format IEEE
                </span>
                <button
                  className={`btn btn-sm ${copiedFormat === 'ieee' ? 'btn-success' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  onClick={() => copyToClipboard(ieee, 'ieee')}
                >
                  <i className={`bi ${copiedFormat === 'ieee' ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                  {copiedFormat === 'ieee' ? 'Tersalin' : 'Salin'}
                </button>
              </div>
              <div
                className="p-2.5 rounded border small"
                style={{
                  borderColor: 'var(--wiki-border)',
                  backgroundColor: 'var(--wiki-sidebar-bg)',
                  color: 'var(--wiki-text-primary)',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                }}
              >
                {ieee}
              </div>
            </div>

            {/* BibTeX Format */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-semibold small" style={{ fontSize: '0.75rem', color: 'var(--wiki-text-secondary)' }}>
                  BibTeX
                </span>
                <button
                  className={`btn btn-sm ${copiedFormat === 'bibtex' ? 'btn-success' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  onClick={() => copyToClipboard(bibtex, 'bibtex')}
                >
                  <i className={`bi ${copiedFormat === 'bibtex' ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                  {copiedFormat === 'bibtex' ? 'Tersalin' : 'Salin'}
                </button>
              </div>
              <pre
                className="p-2.5 rounded border small m-0"
                style={{
                  borderColor: 'var(--wiki-border)',
                  backgroundColor: 'var(--wiki-sidebar-bg)',
                  color: 'var(--wiki-text-primary)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--wiki-font-mono)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {bibtex}
              </pre>
            </div>
          </div>

          <div className="modal-footer border-top py-2 px-4" style={{ borderColor: 'var(--wiki-border)' }}>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
