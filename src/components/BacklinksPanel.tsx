import React from 'react';
import { BacklinkMention } from '../types';

interface BacklinksPanelProps {
  currentTitle: string;
  backlinks: BacklinkMention[];
  onSelectNote: (slug: string) => void;
}

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({
  currentTitle,
  backlinks,
  onSelectNote,
}) => {
  const categoryColorMap: Record<string, string> = {
    Identitas: '#059669',
    Akademik: '#2563eb',
    'Riset & Inovasi': '#7c3aed',
    Robotika: '#d97706',
    Kemahasiswaan: '#db2777',
  };

  return (
    <div
      className="backlinks-panel mt-5 pt-4 border-top"
      style={{ borderColor: 'var(--wiki-border)' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-semibold m-0 d-flex align-items-center gap-2" style={{ fontSize: '1.05rem' }}>
          <i className="bi bi-diagram-2 text-primary"></i>
          <span>Disebutkan di Halaman Lain</span>
          <span
            className="badge rounded-pill border px-2 py-0.5"
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: 'var(--wiki-badge-bg)',
              color: 'var(--wiki-badge-text)',
              borderColor: 'var(--wiki-border)',
            }}
          >
            {backlinks.length} rujukan
          </span>
        </h5>
        <span className="small d-none d-md-inline" style={{ fontSize: '0.75rem', color: 'var(--wiki-text-muted)' }}>
          Tautan Dua Arah Otomatis
        </span>
      </div>

      {backlinks.length === 0 ? (
        <div
          className="p-4 rounded text-center border"
          style={{
            backgroundColor: 'var(--wiki-card-bg)',
            borderColor: 'var(--wiki-border)',
          }}
        >
          <i className="bi bi-link-45deg text-muted display-6 mb-2 d-block opacity-40"></i>
          <p className="text-secondary small mb-1">
            Belum ada artikel lain yang menyebutkan <strong>[[{currentTitle}]]</strong>.
          </p>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Tip: Tulis <code>[[{currentTitle}]]</code> pada artikel lain untuk saling menautkan.
          </span>
        </div>
      ) : (
        <div className="row g-3">
          {backlinks.map((item, idx) => {
            const catColor = categoryColorMap[item.sourceCategory] || '#2563eb';
            return (
              <div key={idx} className="col-12 col-md-6">
                <div
                  className="card h-100 border p-3 text-decoration-none shadow-none"
                  style={{
                    backgroundColor: 'var(--wiki-card-bg)',
                    borderColor: 'var(--wiki-border)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onClick={() => onSelectNote(item.sourceSlug)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--wiki-border)';
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="badge px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${catColor}15`,
                        color: catColor,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.sourceCategory}
                    </span>
                    <i className="bi bi-arrow-up-right text-muted" style={{ fontSize: '0.75rem' }}></i>
                  </div>

                  <h6 className="fw-semibold mb-1.5" style={{ fontSize: '0.9rem', color: 'var(--wiki-text-primary)' }}>
                    {item.sourceTitle}
                  </h6>

                  <p
                    className="small mb-0 fst-italic"
                    style={{
                      fontSize: '0.78rem',
                      lineHeight: '1.5',
                      borderLeft: '2px solid var(--wiki-border)',
                      paddingLeft: '8px',
                      color: 'var(--wiki-text-secondary)',
                    }}
                  >
                    "{item.snippet}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
