
import { SearchResult } from '../types';
import { MOCK_INTERNAL_DOCS, MOCK_VOUCHERS, MOCK_PROJECTS } from '../constants';
import apiClient from '../lib/axios';

export const SearchService = {
  /**
   * Performs a global search across all modules.
   * In a real implementation, this would likely be a single endpoint: /api/search?q={query}
   * For now, we aggregate data from constants/mocks.
   */
  globalSearch: async (query: string): Promise<SearchResult[]> => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Documents
    const matchingDocs = MOCK_INTERNAL_DOCS.filter(doc => 
      doc.title.toLowerCase().includes(normalizedQuery) || 
      doc.trackingId.toLowerCase().includes(normalizedQuery)
    );

    matchingDocs.forEach(doc => {
      results.push({
        id: doc.id,
        title: doc.title,
        subtitle: `${doc.trackingId} • ${doc.originatingDept}`,
        category: 'Documents',
        url: '/workbench', // Or specific doc detail view
        metadata: doc.priority
      });
    });

    // 2. Search Vouchers
    const matchingVouchers = MOCK_VOUCHERS.filter(v => 
      v.payee.toLowerCase().includes(normalizedQuery) || 
      v.refNumber.toLowerCase().includes(normalizedQuery) ||
      v.particulars.toLowerCase().includes(normalizedQuery)
    );

    matchingVouchers.forEach(v => {
      results.push({
        id: v.id,
        title: v.payee,
        subtitle: `${v.refNumber} • ${v.particulars.substring(0, 30)}...`,
        category: 'Vouchers',
        url: '/vouchers',
        metadata: `₱${(v.amount / 1000).toFixed(1)}k`
      });
    });

    // 3. Search Projects
    const matchingProjects = MOCK_PROJECTS.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.location.toLowerCase().includes(normalizedQuery)
    );

    matchingProjects.forEach(p => {
      results.push({
        id: `proj-${p.id}`,
        title: p.name,
        subtitle: `Location: ${p.location}`,
        category: 'Projects',
        url: '/projects',
        metadata: `${p.progress}%`
      });
    });

    // Limit results for UI performance
    return results.slice(0, 10);
  }
};
