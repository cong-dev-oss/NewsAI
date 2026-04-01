'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    ...categories.map(cat => ({ 
      label: cat.name, 
      href: `/categories/${cat.name}` // Giả định slug là name hoặc encode
    })),
    { label: 'Mới nhất', href: '/latest' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-['Pacifico'] text-2xl text-gray-900 cursor-pointer tracking-tight">
            Báo Đọc
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap cursor-pointer">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5">
                <i className="ri-search-line text-gray-400 text-sm"></i>
                <input autoFocus className="text-sm outline-none w-36 text-gray-700 placeholder:text-gray-400 bg-transparent" placeholder="Tìm kiếm..." onBlur={() => setSearchOpen(false)} />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <i className="ri-search-line"></i>
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 cursor-pointer">
              <i className={menuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
