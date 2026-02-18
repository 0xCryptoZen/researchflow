/**
 * Conferences Management Hook
 * 会议管理钩子
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { conferencesRepository, type Conference } from '@/repositories/conferencesRepository';
import { writeJSON } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { FilterOption, ConferenceCategory } from '@/types';

type ConferenceFilterValue = 'all' | ConferenceCategory | 'upcoming';

interface UseConferencesResult {
  // Data
  conferences: Conference[];
  filteredConferences: Conference[];
  
  // Filter state
  filter: ConferenceFilterValue;
  setFilter: (filter: ConferenceFilterValue) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Actions
  addConference: (conference: Omit<Conference, 'id'>) => void;
  updateConference: (id: string, updates: Partial<Conference>) => void;
  deleteConference: (id: string) => void;
  
  // Options
  filterOptions: FilterOption<ConferenceFilterValue>[];
  
  // UI state
  isEmpty: boolean;
}

const FILTER_OPTIONS: FilterOption<ConferenceFilterValue>[] = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: '即将截稿' },
  { value: 'blockchain', label: '区块链' },
  { value: 'security', label: '安全' },
  { value: 'ai', label: '人工智能' },
  { value: 'network', label: '网络' },
  { value: 'other', label: '其他' },
];

export function useConferences(): UseConferencesResult {
  const [conferences, setConferences] = useState<Conference[]>(() => conferencesRepository.getAll());
  const [filter, setFilter] = useState<ConferenceFilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist conferences to storage
  useEffect(() => {
    writeJSON(STORAGE_KEYS.CONFERENCES, conferences);
  }, [conferences]);

  // Helper to check if deadline is upcoming (within 30 days)
  const isUpcoming = useCallback((deadline: string): boolean => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }, []);

  // Filter and search conferences
  const filteredConferences = useMemo(() => {
    let result = [...conferences];
    
    // Apply filter
    if (filter === 'upcoming') {
      result = result.filter(c => isUpcoming(c.deadline));
    } else if (filter !== 'all') {
      result = result.filter(c => c.category === filter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.shortName.toLowerCase().includes(query)
      );
    }
    
    // Sort by deadline (soonest first)
    result.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
    
    return result;
  }, [conferences, filter, searchQuery, isUpcoming]);

  // Actions
  const addConference = useCallback((conference: Omit<Conference, 'id'>) => {
    const newConference = conferencesRepository.add(conference);
    setConferences(conferencesRepository.getAll());
  }, []);

  const updateConference = useCallback((id: string, updates: Partial<Conference>) => {
    conferencesRepository.update(id, updates);
    setConferences(conferencesRepository.getAll());
  }, []);

  const deleteConference = useCallback((id: string) => {
    conferencesRepository.delete(id);
    setConferences(conferencesRepository.getAll());
  }, []);

  const isEmpty = filteredConferences.length === 0;

  return {
    conferences,
    filteredConferences,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    addConference,
    updateConference,
    deleteConference,
    filterOptions: FILTER_OPTIONS,
    isEmpty,
  };
}

export default useConferences;
