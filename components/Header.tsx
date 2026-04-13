'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCategories } from '@/lib/api';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTrendsPage = pathname === '/trends';

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    ...categories.slice(0, 4).map(cat => ({ 
      label: cat.name, 
      href: `/latest?topic=${encodeURIComponent(cat.name)}`
    })),
    { label: 'Mới nhất', href: '/latest' },
    { label: 'Việc làm', href: '/jobs' },
    { label: 'Xu hướng', href: '/trends', hot: true },
  ];

  const headerBg = isTrendsPage
    ? scrolled ? 'bg-[#0D1226]/95 backdrop-blur-md border-white/10' : 'bg-transparent border-transparent'
    : scrolled ? 'bg-white/95 backdrop-blur-md border-gray-200/80 shadow-sm' : 'bg-white border-gray-200';

  const logoColor = isTrendsPage ? 'text-white' : 'text-gray-900';
  const linkColor = isTrendsPage ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900';
  const iconColor = isTrendsPage ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700';
  const searchBorder = isTrendsPage ? 'border-white/20 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200';

  return (
    <header className={`w-full border-b sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className={`flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer ${logoColor}`}>
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-500/30">
              D
            </span>
            <span>Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pulse</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              const isHot = (link as any).hot;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? isTrendsPage
                        ? 'bg-white/10 text-white'
                        : 'bg-indigo-50 text-indigo-600'
                      : linkColor
                  }`}
                >
                  {isHot && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 ${searchBorder}`}>
                <i className={`ri-search-line text-sm ${isTrendsPage ? 'text-gray-400' : 'text-gray-400'}`}></i>
                <input
                  autoFocus
                  className={`text-sm outline-none w-40 bg-transparent ${isTrendsPage ? 'text-white placeholder:text-gray-500' : 'text-gray-700 placeholder:text-gray-400'}`}
                  placeholder="Tìm kiếm..."
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-lg hover:bg-white/10 ${iconColor}`}>
                <i className="ri-search-line"></i>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${iconColor}`}
            >
              <i className={menuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden border-t px-6 py-4 flex flex-col gap-1 ${isTrendsPage ? 'bg-[#0D1226] border-white/10' : 'bg-white border-gray-100'}`}>
          {navLinks.map(link => {
            const isHot = (link as any).hot;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${linkColor}`}
              >
                {isHot && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
