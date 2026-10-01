import React, { useState, useEffect, useMemo } from 'react';
import { NoteItem } from '../types';

interface LeftSidebarProps {
  allNotes: NoteItem[];
  currentSlug: string;
  onSelectNote: (slug: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  allNotes,
  currentSlug,
  onSelectNote,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});

  // Group notes by category and subcategory (excluding pinned beranda note)
  const categories = useMemo(() => {
    const map: Record<string, { directNotes: NoteItem[]; subcategories: Record<string, NoteItem[]> }> = {
      Identitas: { directNotes: [], subcategories: {} },
      Akademik: { directNotes: [], subcategories: {} },
      'Riset & Inovasi': { directNotes: [], subcategories: {} },
      Robotika: { directNotes: [], subcategories: {} },
      Kemahasiswaan: { directNotes: [], subcategories: {} },
      Komunitas: { directNotes: [], subcategories: {} },
    };

    allNotes.forEach(note => {
      if (note.slug === 'beranda') return;
      const cat = note.frontmatter.category || 'Lainnya';
      if (!map[cat]) map[cat] = { directNotes: [], subcategories: {} };

      const sub = note.frontmatter.subcategory;
      if (sub) {
        if (!map[cat].subcategories[sub]) {
          map[cat].subcategories[sub] = [];
        }
        map[cat].subcategories[sub].push(note);
      } else {
        map[cat].directNotes.push(note);
      }
    });

    return map;
  }, [allNotes]);

  // Filter notes based on search & tag
  const filteredCategories = useMemo(() => {
    const result: Record<string, { directNotes: NoteItem[]; subcategories: Record<string, NoteItem[]>; totalCount: number }> = {};

    const filterNote = (n: NoteItem) => {
      const matchesSearch =
        !searchTerm ||
        n.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.frontmatter.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.frontmatter.aliases?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag = !selectedTag || n.frontmatter.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    };

    Object.entries(categories).forEach(([cat, { directNotes, subcategories }]) => {
      const filteredDirect = directNotes.filter(filterNote);
      const filteredSubs: Record<string, NoteItem[]> = {};
      let subTotal = 0;

      Object.entries(subcategories).forEach(([subName, notes]) => {
        const matching = notes.filter(filterNote);
        if (matching.length > 0 || !searchTerm) {
          filteredSubs[subName] = matching;
          subTotal += matching.length;
        }
      });

      const totalCount = filteredDirect.length + subTotal;
      if (totalCount > 0 || !searchTerm) {
        result[cat] = {
          directNotes: filteredDirect,
          subcategories: filteredSubs,
          totalCount,
        };
      }
    });

    return result;
  }, [categories, searchTerm, selectedTag]);

  // Auto-expand current active note's category and subcategory only if not on beranda
  useEffect(() => {
    if (!currentSlug || currentSlug === 'beranda') return;
    const active = allNotes.find(n => n.slug === currentSlug);
    if (active) {
      if (active.frontmatter.category) {
        setCollapsedCategories(prev => ({ ...prev, [active.frontmatter.category]: false }));
      }
      if (active.frontmatter.subcategory) {
        const key = `${active.frontmatter.category}:::${active.frontmatter.subcategory}`;
        setCollapsedSubcategories(prev => ({ ...prev, [key]: false }));
      }
    }
  }, [currentSlug, allNotes]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const current = prev[cat] ?? true;
      return {
        ...prev,
        [cat]: !current,
      };
    });
  };

  const toggleSubcategory = (cat: string, sub: string) => {
    const key = `${cat}:::${sub}`;
    setCollapsedSubcategories(prev => {
      const current = prev[key] ?? true;
      return {
        ...prev,
        [key]: !current,
      };
    });
  };

  const handleCollapseAll = () => {
    const allCat: Record<string, boolean> = {};
    Object.keys(categories).forEach(cat => {
      allCat[cat] = true;
    });
    setCollapsedCategories(allCat);

    const allSub: Record<string, boolean> = {};
    Object.entries(categories).forEach(([cat, { subcategories }]) => {
      Object.keys(subcategories).forEach(sub => {
        allSub[`${cat}:::${sub}`] = true;
      });
    });
    setCollapsedSubcategories(allSub);
  };

  const handleExpandAll = () => {
    const allCat: Record<string, boolean> = {};
    Object.keys(categories).forEach(cat => {
      allCat[cat] = false;
    });
    setCollapsedCategories(allCat);

    const allSub: Record<string, boolean> = {};
    Object.entries(categories).forEach(([cat, { subcategories }]) => {
      Object.keys(subcategories).forEach(sub => {
        allSub[`${cat}:::${sub}`] = false;
      });
    });
    setCollapsedSubcategories(allSub);
  };

  const categoryIcons: Record<string, string> = {
    Identitas: 'bi-bookmark-check text-primary',
    Akademik: 'bi-book text-primary',
    'Riset & Inovasi': 'bi-lightbulb text-primary',
    Robotika: 'bi-gear text-primary',
    Kemahasiswaan: 'bi-people text-primary',
    Komunitas: 'bi-chat-heart text-primary',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`left-sidebar d-flex flex-column h-100 border-end ${
          isOpenMobile ? 'show-mobile' : 'd-none d-md-flex'
        }`}
        style={{
          width: '280px',
          minWidth: '280px',
          maxWidth: '280px',
          backgroundColor: 'var(--wiki-sidebar-bg)',
          borderColor: 'var(--wiki-sidebar-border)',
          position: isOpenMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: isOpenMobile ? 1045 : 100,
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'hidden',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* Sleek Search Input */}
        <div
          className="p-2.5 border-bottom"
          style={{ borderColor: 'var(--wiki-sidebar-border)' }}
        >
          {isOpenMobile && (
            <div className="d-flex justify-content-between align-items-center mb-2 d-md-none">
              <span className="small fw-semibold" style={{ color: 'var(--wiki-text-primary)' }}>
                Daftar Artikel
              </span>
              <button
                className="btn btn-sm p-1 border-0 text-secondary"
                onClick={onCloseMobile}
                aria-label="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}

          <div className="input-group input-group-sm">
            <span
              className="input-group-text border-end-0"
              style={{
                backgroundColor: 'var(--wiki-input-bg)',
                borderColor: 'var(--wiki-sidebar-border)',
                color: 'var(--wiki-text-muted)',
              }}
            >
              <i className="bi bi-search" style={{ fontSize: '0.75rem' }}></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Saring artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                fontSize: '0.82rem',
                backgroundColor: 'var(--wiki-input-bg)',
                color: 'var(--wiki-input-text)',
                borderColor: 'var(--wiki-sidebar-border)',
              }}
            />
            {searchTerm && (
              <button
                className="btn border border-start-0"
                style={{
                  backgroundColor: 'var(--wiki-input-bg)',
                  borderColor: 'var(--wiki-sidebar-border)',
                  color: 'var(--wiki-text-muted)',
                }}
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Tag Filter */}
        {selectedTag && (
          <div
            className="px-3 py-1.5 border-bottom d-flex align-items-center justify-content-between"
            style={{ backgroundColor: 'var(--wiki-card-bg)', borderColor: 'var(--wiki-sidebar-border)' }}
          >
            <span className="small" style={{ fontSize: '0.72rem', color: 'var(--wiki-wikilink-color)' }}>
              <i className="bi bi-tag-fill me-1"></i> #{selectedTag}
            </span>
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              style={{ fontSize: '0.7rem', color: 'var(--wiki-text-muted)' }}
              onClick={() => setSelectedTag(null)}
            >
              Reset
            </button>
          </div>
        )}

        {/* Categories and Notes Tree */}
        <div className="flex-grow-1 overflow-y-auto p-2" style={{ fontSize: '0.82rem' }}>
          <div
            className="small text-uppercase fw-semibold px-2 py-1 mb-1 d-flex justify-content-between"
            style={{ fontSize: '0.67rem', letterSpacing: '0.04em', color: 'var(--wiki-text-muted)' }}
          >
            <span>Daftar Ensiklopedia</span>
            <span>{allNotes.length} Topik</span>
          </div>

          {/* Pinned Beranda / Dashboard Item */}
          <button
            type="button"
            className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 px-2.5 py-1.5 rounded mb-2 transition-all"
            style={{
              backgroundColor: currentSlug === 'beranda' ? 'var(--wiki-item-active-bg)' : 'transparent',
              color: currentSlug === 'beranda' ? 'var(--wiki-link)' : 'var(--wiki-text-primary)',
              fontWeight: currentSlug === 'beranda' ? 600 : 500,
              border: currentSlug === 'beranda' ? '1px solid var(--wiki-item-active-border)' : '1px solid transparent',
            }}
            onClick={() => {
              onSelectNote('beranda');
              if (isOpenMobile) onCloseMobile();
            }}
          >
            <i className="bi bi-house-door-fill" style={{ color: 'var(--wiki-link)' }}></i>
            <span className="flex-grow-1" style={{ fontSize: '0.82rem' }}>Beranda & Panduan</span>
            <span
              className="badge rounded-pill border"
              style={{
                fontSize: '0.62rem',
                backgroundColor: currentSlug === 'beranda' ? 'var(--wiki-badge-bg)' : 'var(--wiki-card-bg)',
                color: currentSlug === 'beranda' ? 'var(--wiki-badge-text)' : 'var(--wiki-text-muted)',
                borderColor: 'var(--wiki-sidebar-border)',
              }}
            >
              Index
            </span>
          </button>

          {Object.entries(filteredCategories).map(([category, { directNotes, subcategories, totalCount }]) => {
            const isCollapsed = collapsedCategories[category] ?? true;
            const iconClass = categoryIcons[category] || 'bi-folder text-primary';

            const renderNoteLink = (note: NoteItem) => {
              const isActive = note.slug === currentSlug;
              return (
                <a
                  key={note.slug}
                  href={`#${note.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectNote(note.slug);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="d-flex align-items-center justify-content-between px-2 py-1 rounded text-decoration-none my-0.5 transition"
                  style={{
                    fontSize: '0.78rem',
                    color: isActive ? 'var(--wiki-sidebar-active-text)' : 'var(--wiki-text-secondary)',
                    backgroundColor: isActive ? 'var(--wiki-sidebar-active-bg)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    borderLeft: isActive ? '3px solid var(--wiki-brand-accent)' : '3px solid transparent',
                  }}
                  title={note.frontmatter.title}
                >
                  <span className="text-truncate">
                    {note.frontmatter.title}
                  </span>
                  {note.backlinks.length > 0 && (
                    <span
                      className="badge bg-transparent ms-1"
                      style={{ fontSize: '0.65rem', color: 'var(--wiki-text-muted)' }}
                      title={`${note.backlinks.length} rujukan`}
                    >
                      {note.backlinks.length}
                    </span>
                  )}
                </a>
              );
            };

            return (
              <div key={category} className="mb-1.5">
                {/* Folder Header */}
                <button
                  className="btn btn-sm w-100 text-start d-flex align-items-center justify-content-between px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--wiki-text-primary)',
                  }}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="d-flex align-items-center gap-1.5 fw-semibold" style={{ fontSize: '0.78rem' }}>
                    <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-down'}`} style={{ fontSize: '0.65rem', color: 'var(--wiki-text-muted)' }}></i>
                    <i className={`bi ${iconClass} me-0.5`}></i>
                    <span>{category}</span>
                  </span>
                  <span
                    className="badge rounded-pill border"
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'var(--wiki-card-bg)',
                      color: 'var(--wiki-text-muted)',
                      borderColor: 'var(--wiki-sidebar-border)',
                    }}
                  >
                    {totalCount}
                  </span>
                </button>

                {/* Folder Contents */}
                {!isCollapsed && (
                  <div className="ps-2 pt-0.5 border-start ms-2.5 my-0.5" style={{ borderColor: 'var(--wiki-sidebar-border)' }}>
                    {/* Direct notes without subfolder */}
                    {directNotes.map(renderNoteLink)}

                    {/* Subfolders (Folder di dalam folder) */}
                    {Object.entries(subcategories).map(([subName, subNotes]) => {
                      const subKey = `${category}:::${subName}`;
                      const isSubCollapsed = collapsedSubcategories[subKey] ?? true;

                      return (
                        <div key={subName} className="my-1">
                          {/* Subfolder Toggle Button */}
                          <button
                            type="button"
                            className="btn btn-sm w-100 text-start d-flex align-items-center justify-content-between px-2 py-1 rounded"
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--wiki-text-primary)',
                            }}
                            onClick={() => toggleSubcategory(category, subName)}
                          >
                            <span className="d-flex align-items-center gap-1.5 fw-medium text-truncate" style={{ fontSize: '0.75rem' }}>
                              <i className={`bi ${isSubCollapsed ? 'bi-chevron-right' : 'bi-chevron-down'}`} style={{ fontSize: '0.6rem', color: 'var(--wiki-text-muted)' }}></i>
                              <i className={`bi ${isSubCollapsed ? 'bi-folder' : 'bi-folder2-open'} me-0.5`} style={{ color: 'var(--wiki-link)', opacity: 0.85 }}></i>
                              <span className="text-truncate">{subName}</span>
                            </span>
                            <span
                              className="badge rounded-pill border"
                              style={{
                                fontSize: '0.62rem',
                                backgroundColor: 'var(--wiki-card-bg)',
                                color: 'var(--wiki-text-muted)',
                                borderColor: 'var(--wiki-sidebar-border)',
                              }}
                            >
                              {subNotes.length}
                            </span>
                          </button>

                          {/* Subfolder Files */}
                          {!isSubCollapsed && (
                            <div className="ps-2 pt-0.5 border-start ms-2.5 my-0.5" style={{ borderColor: 'var(--wiki-sidebar-border)' }}>
                              {subNotes.map(renderNoteLink)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
