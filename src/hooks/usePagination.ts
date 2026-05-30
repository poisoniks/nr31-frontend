import { useState, useCallback } from 'react';

export const usePagination = (initialSize: number = 10) => {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(initialSize);
    const [totalPages, setTotalPages] = useState(0);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const resetPage = useCallback(() => {
        setPage(0);
    }, []);

    return {
        page,
        size,
        totalPages,
        setTotalPages,
        setSize,
        handlePageChange,
        resetPage,
    };
};
