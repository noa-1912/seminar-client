/**
 * DataTable Component
 * Reusable, flexible table component with sorting, filtering, and custom renderers
 * 
 * Usage:
 * const columns = [
 *   { id: 'date', label: 'תאריך', sortable: true },
 *   { id: 'time', label: 'שעה' },
 *   { id: 'status', label: 'סטטוס', render: (value) => <StatusBadge status={value} /> }
 * ];
 * 
 * <DataTable
 *   columns={columns}
 *   rows={data}
 *   onSort={(column, direction) => console.log(column, direction)}
 *   isLoading={false}
 * />
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  CircularProgress,
  Typography,
  Container
} from '@mui/material';
import './DataTable.css';

/**
 * Generic, reusable data table component
 * @component
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ id, label, sortable?, render?, width?, align? }, ...]
 * @param {Array} props.rows - Row data to display
 * @param {Function} props.onSort - Callback when sorting changes (columnId, direction) => void
 * @param {Function} [props.onFilter] - Reserved for caller API compatibility (ignored by this component)
 * @param {boolean} props.isLoading - Show loading spinner, default: false
 * @param {string} props.emptyMessage - Message when no rows, default: 'אין נתונים להצגה'
 * @param {Array} props.sortConfig - Current sort configuration [{ columnId, direction }, ...]
 * @param {boolean} props.striped - Alternate row colors, default: true
 * @param {boolean} props.hoverable - Row hover effect, default: true
 * @param {boolean} props.dense - Compact row height, default: false
 * @param {Function} props.onRowClick - Callback when row is clicked (row) => void
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
function DataTable({
  columns = [],
  rows = [],
  onSort = null,
  isLoading = false,
  emptyMessage = 'אין נתונים להצגה',
  sortConfig = {},
  striped = true,
  hoverable = true,
  dense = false,
  onRowClick = null,
  className = ''
}) {
  const [internalSort, setInternalSort] = useState(sortConfig);

  /**
   * Handle sort label click
   */
  const handleSortClick = (columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    let newDirection = 'asc';
    if (internalSort.columnId === columnId && internalSort.direction === 'asc') {
      newDirection = 'desc';
    }

    const newSort = { columnId, direction: newDirection };
    setInternalSort(newSort);

    if (onSort) {
      onSort(columnId, newDirection);
    }
  };

  /**
   * Get cell value with optional custom renderer
   */
  const getCellValue = (row, column) => {
    const value = row[column.id];

    if (column.render) {
      return column.render(value, row);
    }

    return value;
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Box
        className={`data-table-loading ${className}`}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Render empty state
   */
  if (!rows || rows.length === 0) {
    return (
      <Box
        className={`data-table-empty ${className}`}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          backgroundColor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      className={`data-table-container ${className}`}
      sx={{
        borderRadius: '8px',
        overflow: 'auto'
      }}
    >
      <Table
        className={`data-table ${striped ? 'striped' : ''} ${hoverable ? 'hoverable' : ''}`}
        size={dense ? 'small' : 'medium'}
        aria-label="data table"
      >
        {/* Table Header */}
        <TableHead className="data-table-head">
          <TableRow className="header-row">
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className="header-cell"
                align={column.align || 'right'}
                width={column.width}
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  '&:hover': column.sortable ? {
                    backgroundColor: '#eeeeee'
                  } : {}
                }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={internalSort.columnId === column.id}
                    direction={internalSort.columnId === column.id ? internalSort.direction : 'asc'}
                    onClick={() => handleSortClick(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody className="data-table-body">
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              className={`data-row ${striped && rowIndex % 2 === 1 ? 'striped-row' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                backgroundColor: striped && rowIndex % 2 === 1 ? '#fafafa' : 'inherit',
                '&:hover': hoverable ? {
                  backgroundColor: '#f0f0f0'
                } : {},
                cursor: onRowClick ? 'pointer' : 'default'
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${row.id || rowIndex}-${column.id}`}
                  align={column.align || 'right'}
                  className="data-cell"
                >
                  {getCellValue(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
