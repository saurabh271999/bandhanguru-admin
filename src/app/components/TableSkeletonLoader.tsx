"use client";

import React from "react";
import ContentLoader from "react-content-loader";

interface TableSkeletonLoaderProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
}

const TableSkeletonLoader: React.FC<TableSkeletonLoaderProps> = ({
  rows = 5,
  columns = 6,
  showHeader = true,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showAddButton = true,
}) => {
  const headerHeight = showHeader ? 60 : 0;
  const searchHeight = showSearch ? 60 : 0;
  const filtersHeight = showFilters ? 60 : 0;
  const addButtonHeight = showAddButton ? 60 : 0;
  const paginationHeight = showPagination ? 60 : 0;
  
  const totalHeight = headerHeight + searchHeight + filtersHeight + addButtonHeight + (rows * 60) + paginationHeight + 40;

  return (
    <ContentLoader
      width="100%"
      height={totalHeight}
      viewBox={`0 0 1200 ${totalHeight}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Header */}
      {showHeader && (
        <rect x="20" y="20" rx="6" ry="6" width="200" height="32" />
      )}

      {/* Search Bar - Better aligned and sized */}
      {showSearch && (
        <rect x="20" y={headerHeight + 25} rx="8" ry="8" width="320" height="44" />
      )}

      {/* Filters - Better spacing and alignment */}
      {showFilters && (
        <>
          <rect x="20" y={headerHeight + searchHeight + 35} rx="6" ry="6" width="140" height="40" />
          <rect x="180" y={headerHeight + searchHeight + 35} rx="6" ry="6" width="140" height="40" />
          <rect x="340" y={headerHeight + searchHeight + 35} rx="6" ry="6" width="140" height="40" />
          <rect x="500" y={headerHeight + searchHeight + 35} rx="6" ry="6" width="100" height="40" />
        </>
      )}

      {/* Add Button - Better positioned and sized */}
      {showAddButton && (
        <rect x="20" y={headerHeight + searchHeight + filtersHeight + 45} rx="6" ry="6" width="140" height="40" />
      )}

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const y = headerHeight + searchHeight + filtersHeight + addButtonHeight + 105 + (rowIndex * 60);
        
        return (
          <React.Fragment key={rowIndex}>
            {/* Checkbox - Better positioned */}
            <rect x="20" y={y + 12} rx="3" ry="3" width="16" height="16" />
            
            {/* Row Data - Better spacing */}
            {Array.from({ length: columns }).map((_, colIndex) => {
              const x = 60 + (colIndex * 160);
              const width = colIndex === 0 ? 120 : 140;
              
              return (
                <rect
                  key={colIndex}
                  x={x}
                  y={y + 12}
                  rx="4"
                  ry="4"
                  width={width}
                  height="16"
                />
              );
            })}
            
            {/* Action Buttons - Better aligned and sized */}
            {showActions && (
              <>
                <rect x="1080" y={y + 8} rx="4" ry="4" width="50" height="28" />
                <rect x="1140" y={y + 8} rx="4" ry="4" width="50" height="28" />
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Pagination - Better positioned */}
      {showPagination && (
        <>
          <rect x="20" y={headerHeight + searchHeight + filtersHeight + addButtonHeight + (rows * 60) + 125} rx="6" ry="6" width="180" height="32" />
          <rect x="780" y={headerHeight + searchHeight + filtersHeight + addButtonHeight + (rows * 60) + 125} rx="6" ry="6" width="380" height="32" />
        </>
      )}
    </ContentLoader>
  );
};

export default TableSkeletonLoader;
