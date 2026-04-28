import { useCallback, useEffect, useRef, useState } from 'react';
import { searchJobs } from '../api/jobsSearch.api';

const PAGE_SIZE    = 10;
const DEBOUNCE_MS  = 500;

/**
 * Custom hook that manages jobs search state and fetches from /api/jobs/search.
 *
 * Filters:
 *   searchTerm  – free-text (debounced 500 ms)
 *   field       – enum string: 'Development' | 'QA' | 'DevOps' | ''
 *   tagId       – numeric tag id | null
 *
 * Returns filter setters, result data, isLoading, error, and pagination helpers.
 */
export function useJobsSearch() {
  // ── filter state ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTermRaw] = useState('');
  const [field,      setField]         = useState('');
  const [tagId,      setTagId]         = useState(null);
  const [pageNumber, setPageNumber]    = useState(1);

  // internal debounced value used for the actual fetch
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // ── result state ──────────────────────────────────────────────────────────
  const [jobs,       setJobs]       = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);

  // ── debounce searchTerm ───────────────────────────────────────────────────
  const debounceTimer = useRef(null);

  const setSearchTerm = useCallback((value) => {
    setSearchTermRaw(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedTerm(value);
      setPageNumber(1);
    }, DEBOUNCE_MS);
  }, []);

  // reset page when non-text filters change
  const handleSetField = useCallback((value) => {
    setField(value);
    setPageNumber(1);
  }, []);

  const handleSetTagId = useCallback((value) => {
    setTagId(value);
    setPageNumber(1);
  }, []);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchJobs({
        searchTerm: debouncedTerm,
        field,
        tagId,
        pageNumber,
        pageSize: PAGE_SIZE,
      });
      setJobs(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(data?.totalPages  ?? 0);
      setTotalCount(data?.totalCount  ?? 0);
    } catch (err) {
      setError(err.message || 'אירעה שגיאה בלתי צפויה.');
      setJobs([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedTerm, field, tagId, pageNumber]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  return {
    // filter values & setters
    searchTerm,
    setSearchTerm,
    field,
    setField: handleSetField,
    tagId,
    setTagId: handleSetTagId,
    // pagination
    pageNumber,
    setPageNumber,
    totalPages,
    totalCount,
    // result
    jobs,
    isLoading,
    error,
    // manual refresh
    refresh: fetchJobs,
  };
}
