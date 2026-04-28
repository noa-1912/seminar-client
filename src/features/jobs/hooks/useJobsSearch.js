import { useCallback, useEffect, useRef, useState } from 'react';
import { searchJobs } from '../../../api';

const PAGE_SIZE   = 10;
const DEBOUNCE_MS = 500;

/**
 * Custom hook that manages jobs search state and fetches from /api/jobs/search.
 *
 * Filters:
 *   searchTerm  – free-text (debounced 500 ms)
 *   field       – enum string: 'Development' | 'QA' | 'DevOps' | ''
 *   tagId       – numeric tag id | null
 */
export function useJobsSearch() {
  const [searchTerm,    setSearchTermRaw] = useState('');
  const [field,         setField]         = useState('');
  const [tagId,         setTagId]         = useState(null);
  const [pageNumber,    setPageNumber]    = useState(1);
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const [jobs,       setJobs]       = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);

  const debounceTimer = useRef(null);

  const setSearchTerm = useCallback((value) => {
    setSearchTermRaw(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedTerm(value);
      setPageNumber(1);
    }, DEBOUNCE_MS);
  }, []);

  const handleSetField = useCallback((value) => {
    setField(value);
    setPageNumber(1);
  }, []);

  const handleSetTagId = useCallback((value) => {
    setTagId(value);
    setPageNumber(1);
  }, []);

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
      setTotalPages(data?.totalPages ?? 0);
      setTotalCount(data?.totalCount ?? 0);
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

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  return {
    searchTerm,
    setSearchTerm,
    field,
    setField: handleSetField,
    tagId,
    setTagId: handleSetTagId,
    pageNumber,
    setPageNumber,
    totalPages,
    totalCount,
    jobs,
    isLoading,
    error,
    refresh: fetchJobs,
  };
}
