/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NoteItem } from './types';
import { loadAllNotes } from './utils/markdownParser';
import { LeftSidebar } from './components/LeftSidebar';
import { WikilinkRenderer } from './components/WikilinkRenderer';
import { HoverPreviewCard } from './components/HoverPreviewCard';
import { BacklinksPanel } from './components/BacklinksPanel';
import { TableOfContents } from './components/TableOfContents';
import { LocalGraphView } from './components/LocalGraphView';
import { GlobalGraphModal } from './components/GlobalGraphModal';
import { CitationModal } from './components/CitationModal';
import { QuickSearchModal } from './components/QuickSearchModal';

export default function App() {
  const [allNotes, setAllNotes] = useState<NoteItem[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string>('beranda');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalGraphOpen, setIsGlobalGraphOpen] = useState(false);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 1200 : true);

  // Resize listener to prevent duplicate canvas mounts
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hover Popover State
  const [hoveredNote, setHoveredNote] = useState<NoteItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Initialize and load all notes
  useEffect(() => {
    const loaded = loadAllNotes();
    setAllNotes(loaded);

    // Read initial slug from URL hash if available (defaults to beranda)
    const hash = window.location.hash.replace('#', '');
    if (hash && loaded.some(n => n.slug === hash)) {
      setCurrentSlug(hash);
    } else if (loaded.some(n => n.slug === 'beranda')) {
      setCurrentSlug('beranda');
    } else if (loaded.length > 0) {
      setCurrentSlug(loaded[0].slug);
    }
  }, []);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentSlug && allNotes.some(n => n.slug === hash)) {
        setCurrentSlug(hash);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allNotes, currentSlug]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Note
  const currentNote = useMemo(() => {
    return allNotes.find(n => n.slug === currentSlug) || allNotes[0] || null;
  }, [allNotes, currentSlug]);

  // Navigate to a note (INSTANT, snappy navigation without smooth-scroll thread lock)
  const handleSelectNote = useCallback((slug: string) => {
    setCurrentSlug(slug);
    if (window.location.hash !== `#${slug}`) {
      window.location.hash = slug;
    }
    window.scrollTo(0, 0);
    setHoveredNote(null);
  }, []);

  // Next and Previous notes navigation
  const { prevNote, nextNote } = useMemo(() => {
    if (!currentNote || allNotes.length <= 1) return { prevNote: null, nextNote: null };
    const currentIndex = allNotes.findIndex(n => n.slug === currentNote.slug);
    const prev = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
    const next = currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;
    return { prevNote: prev, nextNote: next };
  }, [allNotes, currentNote]);

  const [isCopied, setIsCopied] = useState(false);

  // Dynamic SEO & Theme Color update
  useEffect(() => {
    // 1. Update Theme Color Meta
    const themeColor = theme === 'dark' ? '#071526' : '#1a4577';
    const themeMeta = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', themeColor);
    }

    // 2. Update Dynamic Page Title & Meta Tags
    if (currentNote) {
      if (currentNote.slug === 'beranda') {
        document.title = 'PENS Wiki - Ensiklopedia Politeknik Elektronika Negeri Surabaya';
      } else {
        document.title = `${currentNote.frontmatter.title} | PENS Wiki`;
      }

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && currentNote.frontmatter.summary) {
        metaDesc.setAttribute('content', currentNote.frontmatter.summary);
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${currentNote.frontmatter.title} | PENS Wiki`);
      }

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && currentNote.frontmatter.summary) {
        ogDesc.setAttribute('content', currentNote.frontmatter.summary);
      }

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${currentNote.frontmatter.title} | PENS Wiki`);
      }

      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc && currentNote.frontmatter.summary) {
        twitterDesc.setAttribute('content', currentNote.frontmatter.summary);
      }
    }
  }, [currentNote, theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!currentNote) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-secondary">
        <div className="text-center">
          <div className="spinner-border text-secondary mb-3" role="status"></div>
          <h6>Memuat Ensiklopedia PENS Wiki...</h6>
        </div>
      </div>
    );
  }

  const categoryColorMap: Record<string, string> = {
    Identitas: '#059669',
    Akademik: '#2563eb',
    'Riset & Inovasi': '#7c3aed',
    Robotika: '#d97706',
    Kemahasiswaan: '#db2777',
  };
  const catColor = categoryColorMap[currentNote.frontmatter.category] || '#4b5563';

  return (
    <div className="pens-wiki-app min-vh-100 d-flex flex-column" data-theme={theme}>
      {/* Top Navbar - Clean, Classic PENS Blue Header */}
      <header
        className="navbar navbar-expand px-3 py-2 sticky-top shadow-sm"
        style={{
          backgroundColor: 'var(--wiki-navbar-bg)',
          borderBottom: '1px solid var(--wiki-border)',
          zIndex: 1030,
          transition: 'background-color 0.2s ease',
        }}
      >
        <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
          {/* Left: Mobile Navigation Button & PENS Logo Brand */}
          <div className="d-flex align-items-center gap-1 gap-sm-2">
            {!isReadingMode && (
              <button
                className="pens-icon-btn d-md-none me-1"
                onClick={() => setIsMobileSidebarOpen(true)}
                title="Buka Navigasi"
                aria-label="Menu Navigasi"
              >
                <i className="bi bi-list fs-3"></i>
              </button>
            )}

            <a
              href="#"
              className="d-flex align-items-center gap-2 text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                handleSelectNote('beranda');
              }}
            >
              {/* Logo PENS Resmi dalam kotak square rounded */}
              <div className="pens-logo-box">
                <img
                  src="https://upload.wikimedia.org/wikipedia/id/4/44/Logo_PENS.png"
                  alt="Logo PENS"
                  width={30}
                  height={30}
                  referrerPolicy="no-referrer"
                  className="object-fit-contain"
                />
              </div>

              {/* Judul PENS Wiki disembunyikan di HP/mobile agar bagian atas tidak penuh */}
              <div className="d-none d-md-block">
                <span className="fw-bold pens-header-title d-block lh-1" style={{ fontSize: '1.02rem', letterSpacing: '-0.01em' }}>
                  PENS Wiki
                </span>
                <span className="pens-header-sub small" style={{ fontSize: '0.67rem' }}>
                  Ensiklopedia Politeknik Elektronika Negeri Surabaya
                </span>
              </div>
            </a>
          </div>

          {/* Center: Search Trigger (Desktop only) */}
          <div className="mx-3 flex-grow-1 d-none d-md-flex justify-content-center" style={{ maxWidth: '400px' }}>
            <button
              type="button"
              className="btn pens-header-search w-100 text-start d-flex align-items-center justify-content-between px-3 py-1.5 rounded"
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="d-flex align-items-center gap-2 text-white-50">
                <i className="bi bi-search"></i>
                <span className="text-truncate text-white" style={{ fontSize: '0.84rem' }}>
                  Cari topik ensiklopedia...
                </span>
              </span>
              <kbd
                className="bg-dark bg-opacity-25 text-white-50 border-0 px-1.5 py-0.5 rounded small"
                style={{ fontSize: '0.65rem' }}
              >
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Actions: Hanya ada search, book (mode baca), dan bulan (theme switch) */}
          <div className="d-flex align-items-center gap-1 gap-sm-3">
            {/* Search Icon Button */}
            <button
              className="pens-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              title="Cari artikel (Ctrl+K)"
              aria-label="Cari"
            >
              <i className="bi bi-search"></i>
            </button>

            {/* Mode Baca Toggle (Hanya tampil di desktop, disembunyikan di HP/mobile) */}
            <button
              type="button"
              className={`pens-icon-btn d-none d-md-inline-flex ${isReadingMode ? 'active' : ''}`}
              onClick={() => setIsReadingMode(!isReadingMode)}
              title={isReadingMode ? 'Keluar Mode Baca (Tampilkan bilah sisi)' : 'Mode Baca (Sembunyikan bilah sisi untuk fokus membaca teks)'}
              aria-label="Mode Baca"
            >
              <i className={`bi ${isReadingMode ? 'bi-book-half' : 'bi-book'}`}></i>
            </button>

            {/* Theme Toggle (Icon Bulan / Matahari) */}
            <button
              type="button"
              className="pens-icon-btn"
              onClick={toggleTheme}
              title={`Ganti tema (${theme === 'light' ? 'Mode Gelap' : 'Mode Terang'})`}
              aria-label="Ganti Tema"
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun text-warning'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: 3 Columns (or 1 column in Reading Mode) */}
      <div className="d-flex flex-grow-1 w-100 position-relative">
        {/* Column 1: Left Sidebar (Tree Navigator) */}
        {!isReadingMode && (
          <LeftSidebar
            allNotes={allNotes}
            currentSlug={currentSlug}
            onSelectNote={handleSelectNote}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Column 2: Main Editorial Article View */}
        <main
          className="flex-grow-1 px-3 px-md-4 px-lg-5 py-4 overflow-x-hidden"
          style={{
            maxWidth: isReadingMode ? '760px' : '820px',
            minWidth: 0,
            margin: '0 auto',
            transition: 'max-width 0.2s ease',
          }}
        >
          {/* Reading Mode indicator banner */}
          {isReadingMode && (
            <div
              className="d-flex align-items-center justify-content-between p-2 px-3 rounded mb-3 border small"
              style={{
                backgroundColor: 'var(--wiki-card-bg)',
                borderColor: 'var(--wiki-border)',
                fontSize: '0.76rem',
              }}
            >
              <span className="d-flex align-items-center gap-1.5" style={{ color: 'var(--wiki-text-secondary)' }}>
                <i className="bi bi-book text-primary"></i>
                <span>Mode Baca Aktif &bull; Bilah sisi disembunyikan untuk fokus membaca</span>
              </span>
              <button
                className="btn btn-sm btn-link text-decoration-none p-0 fw-medium"
                style={{ fontSize: '0.76rem', color: 'var(--wiki-brand-accent)' }}
                onClick={() => setIsReadingMode(false)}
              >
                Tampilkan Bilah Sisi &times;
              </button>
            </div>
          )}

          {/* Breadcrumb & Actions Bar */}
          <div
            className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom"
            style={{ borderColor: 'var(--wiki-border)' }}
          >
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0 small" style={{ fontSize: '0.76rem' }}>
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    className="text-decoration-none"
                    style={{ color: 'var(--wiki-text-secondary)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectNote('beranda');
                    }}
                  >
                    PENS Wiki
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <span style={{ color: 'var(--wiki-text-muted)' }}>{currentNote.frontmatter.category}</span>
                </li>
                {currentNote.frontmatter.subcategory && (
                  <li className="breadcrumb-item">
                    <span style={{ color: 'var(--wiki-text-muted)' }}>{currentNote.frontmatter.subcategory}</span>
                  </li>
                )}
                <li
                  className="breadcrumb-item active fw-semibold"
                  style={{ color: 'var(--wiki-text-primary)' }}
                  aria-current="page"
                >
                  {currentNote.frontmatter.title}
                </li>
              </ol>
            </nav>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-link text-decoration-none p-0"
                style={{ fontSize: '0.75rem', color: 'var(--wiki-text-secondary)' }}
                onClick={() => setIsCitationOpen(true)}
                title="Salin sitasi ilmiah"
              >
                <i className="bi bi-quote me-1"></i> Sitasi
              </button>
              <span style={{ color: 'var(--wiki-text-muted)' }}>&bull;</span>
              <button
                className="btn btn-sm btn-link text-decoration-none p-0"
                style={{ fontSize: '0.75rem', color: isCopied ? '#16a34a' : 'var(--wiki-text-secondary)' }}
                onClick={copyCurrentUrl}
                title="Salin URL artikel"
              >
                <i className={`bi ${isCopied ? 'bi-check2' : 'bi-share'} me-1`}></i>
                {isCopied ? 'Tersalin!' : 'Bagikan'}
              </button>
            </div>
          </div>

          {/* Article Header Metadata */}
          <header className="mb-4">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span
                className="badge px-2 py-0.5 rounded fw-medium"
                style={{
                  backgroundColor: `${catColor}15`,
                  color: catColor,
                  fontSize: '0.74rem',
                }}
              >
                {currentNote.frontmatter.category}
              </span>

              <span className="small" style={{ fontSize: '0.74rem', color: 'var(--wiki-text-muted)' }}>
                Diperbarui: {currentNote.frontmatter.updated}
              </span>

              <span className="small" style={{ fontSize: '0.74rem', color: 'var(--wiki-text-muted)' }}>
                &bull; ~{currentNote.readingTimeMinutes} min baca ({currentNote.wordCount} kata)
              </span>
            </div>

            {/* Aliases List if present */}
            {currentNote.frontmatter.aliases && currentNote.frontmatter.aliases.length > 0 && (
              <div
                className="d-flex flex-wrap align-items-center gap-1.5 mb-3 small"
                style={{ fontSize: '0.74rem', color: 'var(--wiki-text-secondary)' }}
              >
                <span style={{ color: 'var(--wiki-text-muted)' }}>Disebut juga:</span>
                {currentNote.frontmatter.aliases.map((alias, idx) => (
                  <span
                    key={idx}
                    className="badge border px-1.5 py-0.5"
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: 'var(--wiki-badge-bg)',
                      color: 'var(--wiki-badge-text)',
                      borderColor: 'var(--wiki-border)',
                    }}
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}

            {/* Executive Summary Card (Calm Editorial Style) */}
            {currentNote.frontmatter.summary && (
              <div
                className="p-3 rounded border mb-4"
                style={{
                  backgroundColor: 'var(--wiki-card-bg)',
                  borderColor: 'var(--wiki-border)',
                }}
              >
                <p className="mb-0 small" style={{ lineHeight: '1.65', color: 'var(--wiki-text-secondary)' }}>
                  {currentNote.frontmatter.summary}
                </p>
              </div>
            )}
          </header>

          {/* Rendered Markdown Body with Wikilinks */}
          <article className="article-body">
            <WikilinkRenderer
              content={currentNote.content}
              allNotes={allNotes}
              onSelectNote={handleSelectNote}
              onHoverLink={(note, pos) => {
                if (note) {
                  setHoveredNote(note);
                  setHoverPosition(pos);
                } else if (!isCardHovered) {
                  setHoveredNote(null);
                }
              }}
            />
          </article>

          {/* Tags Section */}
          {currentNote.frontmatter.tags && currentNote.frontmatter.tags.length > 0 && (
            <div
              className="mt-5 pt-3 border-top d-flex flex-wrap align-items-center gap-1.5"
              style={{ borderColor: 'var(--wiki-border)' }}
            >
              <span className="small me-1" style={{ color: 'var(--wiki-text-muted)' }}>Topik:</span>
              {currentNote.frontmatter.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="badge border px-2 py-0.5"
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: 'var(--wiki-badge-bg)',
                    color: 'var(--wiki-badge-text)',
                    borderColor: 'var(--wiki-border)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Next / Previous Article Navigation */}
          <div
            className="d-flex flex-column flex-sm-row justify-content-between gap-2.5 mt-4 pt-3 border-top"
            style={{ borderColor: 'var(--wiki-border)' }}
          >
            {prevNote ? (
              <button
                className="btn btn-sm btn-outline-secondary text-start p-2.5 rounded d-flex flex-column flex-fill"
                onClick={() => handleSelectNote(prevNote.slug)}
              >
                <span className="small" style={{ fontSize: '0.68rem', color: 'var(--wiki-text-muted)' }}>
                  &larr; Artikel Sebelumnya
                </span>
                <span className="fw-semibold text-truncate" style={{ fontSize: '0.84rem', color: 'var(--wiki-text-primary)' }}>
                  {prevNote.frontmatter.title}
                </span>
              </button>
            ) : <div className="d-none d-sm-block flex-fill" />}

            {nextNote && (
              <button
                className="btn btn-sm btn-outline-secondary text-start text-sm-end p-2.5 rounded d-flex flex-column flex-fill"
                onClick={() => handleSelectNote(nextNote.slug)}
              >
                <span className="small" style={{ fontSize: '0.68rem', color: 'var(--wiki-text-muted)' }}>
                  Artikel Selanjutnya &rarr;
                </span>
                <span className="fw-semibold text-truncate" style={{ fontSize: '0.84rem', color: 'var(--wiki-text-primary)' }}>
                  {nextNote.frontmatter.title}
                </span>
              </button>
            )}
          </div>

          {/* Mobile & Tablet: Peta Graf Relasi di Bawah Blog agar tetap kelihatan */}
          {!isDesktop && (
            <div className="my-4">
              <LocalGraphView
                currentNote={currentNote}
                allNotes={allNotes}
                onSelectNote={handleSelectNote}
                onOpenGlobalGraph={() => setIsGlobalGraphOpen(true)}
              />
            </div>
          )}

          {/* Bottom Panel: Backlinks & Mentions */}
          <BacklinksPanel
            currentTitle={currentNote.frontmatter.title}
            backlinks={currentNote.backlinks}
            onSelectNote={handleSelectNote}
          />
        </main>

        {/* Column 3: Right Sidebar (Mini Local Graph & Outline) */}
        {!isReadingMode && (
          <aside
            className="right-sidebar d-none d-xl-block p-3 border-start"
            style={{
              width: '280px',
              minWidth: '280px',
              maxWidth: '280px',
              backgroundColor: 'var(--wiki-sidebar-bg)',
              borderColor: 'var(--wiki-sidebar-border)',
              position: 'sticky',
              top: '52px',
              height: 'calc(100vh - 52px)',
              overflowY: 'auto',
              transition: 'background-color 0.2s ease',
            }}
          >
            {/* Interactive Draggable Local Graph */}
            {isDesktop && (
              <LocalGraphView
                currentNote={currentNote}
                allNotes={allNotes}
                onSelectNote={handleSelectNote}
                onOpenGlobalGraph={() => setIsGlobalGraphOpen(true)}
              />
            )}

            {/* Table of Contents */}
            <TableOfContents
              headings={currentNote.headings}
              currentNote={currentNote}
              onOpenCitation={() => setIsCitationOpen(true)}
            />
          </aside>
        )}
      </div>

      {/* Floating Hover Preview Card for Wikilinks */}
      {hoveredNote && (
        <HoverPreviewCard
          note={hoveredNote}
          position={hoverPosition}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => {
            setIsCardHovered(false);
            setHoveredNote(null);
          }}
          onSelectNote={handleSelectNote}
          onClose={() => {
            setIsCardHovered(false);
            setHoveredNote(null);
          }}
        />
      )}

      {/* Modals */}
      <GlobalGraphModal
        isOpen={isGlobalGraphOpen}
        onClose={() => setIsGlobalGraphOpen(false)}
        allNotes={allNotes}
        currentSlug={currentNote.slug}
        onSelectNote={handleSelectNote}
      />

      <CitationModal
        isOpen={isCitationOpen}
        onClose={() => setIsCitationOpen(false)}
        note={currentNote}
      />

      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allNotes={allNotes}
        onSelectNote={handleSelectNote}
      />
    </div>
  );
}
