'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="hidden lg:flex flex-1 max-w-md xl:max-w-xl mx-4 xl:mx-8 relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={20} className="text-theme-muted group-focus-within:text-theme-accent transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for fresh seafood, platters, or regions..."
        className="w-full bg-theme-tertiary hover:bg-theme-secondary border-2 border-transparent transition-all text-theme-primary rounded-full py-3 pl-12 pr-20 text-sm focus:outline-none focus:border-theme-accent placeholder:text-theme-muted shadow-inner"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <button type="submit" className="bg-theme-accent hover:bg-theme-accent/90 active:bg-theme-accent/80 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
          Find
        </button>
      </div>
    </form>
  );
}
