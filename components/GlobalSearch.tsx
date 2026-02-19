import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, DollarSign, Briefcase, ChevronRight, X } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import { SearchService } from '../services/search.service';
import { SearchResult, SearchCategory } from '../types';

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await SearchService.globalSearch(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectResult = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  const getCategoryIcon = (category: SearchCategory) => {
    switch(category) {
        case 'Documents': return <FileText size={16} className="text-blue-500"/>;
        case 'Vouchers': return <DollarSign size={16} className="text-emerald-500"/>;
        case 'Projects': return <Briefcase size={16} className="text-orange-500"/>;
        default: return <Search size={16} className="text-slate-400"/>;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true) }}
          placeholder="Search documents, vouchers, projects..." 
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gov-500/20 focus:border-gov-500 focus:bg-white placeholder:text-slate-400"
        />
        <div className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-gov-600 transition-colors">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        {query && (
            <button 
                onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                className="absolute right-3 top-2.5 text-slate-300 hover:text-slate-500"
            >
                <X size={16} />
            </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
           {results.length > 0 ? (
               <div className="py-2 max-h-[400px] overflow-y-auto">
                   <div className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
                       Best Matches
                   </div>
                   {results.map((result) => (
                       <div 
                         key={result.id}
                         onClick={() => handleSelectResult(result.url)}
                         className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-4 transition-colors border-b border-slate-50 last:border-0 group"
                       >
                          <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                              {getCategoryIcon(result.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                  <h4 className="text-sm font-bold text-slate-800 truncate">{result.title}</h4>
                                  {result.metadata && (
                                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                                          {result.metadata}
                                      </span>
                                  )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{result.category} • {result.subtitle}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-gov-500 opacity-0 group-hover:opacity-100 transition-all" />
                       </div>
                   ))}
               </div>
           ) : (
               <div className="p-8 text-center text-slate-400">
                   <p className="text-sm">No results found for "{query}"</p>
               </div>
           )}
           <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
               Press Enter to view all results
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;