/**
 * Papers Management Hook
 * 论文管理钩子
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { papersRepository, type SavedPaper } from '@/repositories/papersRepository';
import { writeJSON } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { FilterOption, PaperSource } from '@/types';

type PaperFilterValue = 'all' | 'favorites' | PaperSource;

interface UsePapersResult {
  // Data
  papers: SavedPaper[];
  filteredPapers: SavedPaper[];
  
  // Filter state
  filter: PaperFilterValue;
  setFilter: (filter: PaperFilterValue) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Actions
  toggleFavorite: (id: string) => void;
  deletePaper: (id: string) => void;
  updatePaper: (id: string, updates: Partial<SavedPaper>) => void;
  
  // Options
  filterOptions: FilterOption<PaperFilterValue>[];
  
  // UI state
  isEmpty: boolean;
}

const FILTER_OPTIONS: FilterOption<PaperFilterValue>[] = [
  { value: 'all', label: '全部' },
  { value: 'favorites', label: '收藏' },
  { value: 'arxiv', label: 'arXiv' },
  { value: 'scholar', label: 'Google Scholar' },
  { value: 'dblp', label: 'DBLP' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'acm', label: 'ACM' },
];

export function usePapers(): UsePapersResult {
  const [papers, setPapers] = useState<SavedPaper[]>(() => papersRepository.getAll());
  const [filter, setFilter] = useState<PaperFilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist papers to storage
  useEffect(() => {
    writeJSON(STORAGE_KEYS.PAPERS, papers);
  }, [papers]);

  // Filter and search papers
  const filteredPapers = useMemo(() => {
    let result = [...papers];
    
    // Apply source filter
    if (filter === 'favorites') {
      result = result.filter(p => p.isFavorite);
    } else if (filter !== 'all') {
      result = result.filter(p => p.source === filter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.authors.some(a => a.toLowerCase().includes(query)) ||
        p.abstract.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => 
      new Date(b.createdAt || b.publishedDate).getTime() - 
      new Date(a.createdAt || a.publishedDate).getTime()
    );
    
    return result;
  }, [papers, filter, searchQuery]);

  // Actions
  const toggleFavorite = useCallback((id: string) => {
    const paper = papersRepository.getById(id);
    if (!paper) return;
    
    papersRepository.update(id, { isFavorite: !paper.isFavorite });
    setPapers(papersRepository.getAll());
  }, []);

  const deletePaper = useCallback((id: string) => {
    papersRepository.delete(id);
    setPapers(papersRepository.getAll());
  }, []);

  const updatePaper = useCallback((id: string, updates: Partial<SavedPaper>) => {
    papersRepository.update(id, updates);
    setPapers(papersRepository.getAll());
  }, []);

  const isEmpty = filteredPapers.length === 0;

  return {
    papers,
    filteredPapers,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    deletePaper,
    updatePaper,
    filterOptions: FILTER_OPTIONS,
    isEmpty,
  };
}

export default usePapers;
