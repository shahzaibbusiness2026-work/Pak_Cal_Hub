'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import SearchModal from './SearchModal';
import ThemeToggle from '../ui/ThemeToggle';
import { CategoryIcon } from '../ui/categoryIcons';
import { CATEGORIES_DATA, getCategoryById } from '../../lib/data/categories-meta';

interface NavDropdownItem {
  id: string;
  label: string;
  categorySlug: string;
  badge?: string;
}

const PRIMARY_NAV_CATEGORIES: NavDropdownItem[] = [
  { id: 'salary', label: 'Salary & Govt', categorySlug: 'salary' },
  { id: 'tax', label: 'FBR Tax 2026', categorySlug: 'tax', badge: 'New Slabs' },
  { id: 'electricity', label: 'Electricity & Solar', categorySlug: 'electricity' },
  { id: 'property', label: 'Property & Land', categorySlug: 'property' },
  { id: 'education', label: 'Education & Merit', categorySlug: 'education' },
  { id: 'islamic', label: 'Islamic & Zakat', categorySlug: 'islamic', badge: 'Nisab' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  
  const navContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdownId(id);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 180);
  };

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalTools = CATEGORIES_DATA.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md shadow-emerald-900/20 dark:from-emerald-600 dark:to-emerald-900">
                <Calculator className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pak Calc <span className="text-emerald-700 dark:text-emerald-400">Hub</span>
              </span>
            </Link>
          </div>

          {/* Primary Navigation with Category Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1" ref={navContainerRef} aria-label="Primary navigation">
            {PRIMARY_NAV_CATEGORIES.map((item) => {
              const category = getCategoryById(item.categorySlug);
              if (!category) return null;
              const isOpen = openDropdownId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-800 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu for this Specific Category */}
                  {isOpen && (
                    <div className="absolute left-0 top-full z-50 pt-1.5 w-80">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-800 dark:text-emerald-400">
                              {<CategoryIcon icon={category.icon} className="h-4 w-4" />}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                          <Link
                            href={`/${category.slug}`}
                            className="text-[11px] font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                          >
                            View all ({category.tools.length})
                          </Link>
                        </div>

                        <div className="space-y-1 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                          {category.tools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={`/${tool.category}/${tool.slug}`}
                              className="group flex flex-col rounded-xl px-2.5 py-2 transition-colors hover:bg-emerald-50 dark:hover:bg-slate-900"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 dark:text-slate-200 dark:group-hover:text-emerald-400">
                                  {tool.title}
                                </span>
                                {tool.trending && (
                                  <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {tool.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "More Tools" Dropdown for remaining categories */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('more')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenDropdownId(openDropdownId === 'more' ? null : 'more')}
                aria-expanded={openDropdownId === 'more'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                  openDropdownId === 'more'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-400'
                }`}
              >
                <span>More Tools</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    openDropdownId === 'more' ? 'rotate-180 text-emerald-800 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* More Tools landscape category card */}
              {openDropdownId === 'more' && (
                <div className="absolute right-0 top-full z-50 w-[min(92vw,780px)] pt-2">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/15 dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                          All tool categories
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {totalTools} calculators across {CATEGORIES_DATA.length} Pakistan-focused categories
                        </p>
                      </div>
                      <Link
                        href="/#categories"
                        className="text-[11px] font-bold text-emerald-800 hover:underline dark:text-emerald-400"
                      >
                        Browse category overview →
                      </Link>
                    </div>

                    <div className="grid max-h-[68vh] grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar xl:grid-cols-3">
                      {CATEGORIES_DATA.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/${cat.slug}`}
                          className="group flex min-h-[72px] items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-900 dark:hover:bg-slate-900"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-emerald-900 dark:bg-slate-950 dark:text-emerald-400 dark:ring-slate-800">
                            {<CategoryIcon icon={cat.icon} className="h-4.5 w-4.5" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-extrabold text-slate-900 group-hover:text-emerald-900 dark:text-white dark:group-hover:text-emerald-300">
                              {cat.name}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {cat.tools.length} tools
                            </span>
                            <span className="mt-1 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {cat.tools[0]?.title}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons: Dark Mode Toggle + Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex touch-manipulation appearance-none items-center justify-center border-0 bg-transparent p-0 leading-none text-slate-700 shadow-none transition-colors hover:bg-transparent hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 dark:bg-transparent dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-emerald-300 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu accordion drawer */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="border-b border-slate-200 bg-white px-3 sm:px-4 py-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden max-h-[80vh] overflow-y-auto overscroll-contain custom-scrollbar shadow-2xl pb-8">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Most Popular Categories & Tools
              </div>

              {CATEGORIES_DATA.map((cat) => {
                const isExpanded = expandedMobileCat === cat.id;
                return (
                  <div key={cat.id} className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedMobileCat(isExpanded ? null : cat.id)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center justify-between p-3 text-left text-xs font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-900/60 min-h-[44px] touch-manipulation"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-800 dark:text-emerald-400">
                          {<CategoryIcon icon={cat.icon} className="h-4 w-4" />}
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                        {cat.tools.map((t) => (
                          <Link
                            key={t.id}
                            href={`/${t.category}/${t.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-900"
                          >
                            {t.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                <Link
                  href="/#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  All 13 Categories Overview
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Dialog Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
