"use client";

import React from "react";
import TableSkeletonLoader from "./TableSkeletonLoader";
import FormSkeletonLoader from "./FormSkeletonLoader";

interface LoaderProps {
  type?: "table" | "spinner" | "default" | "form";
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
  
  // Form loader props
  fields?: number;
  showTitle?: boolean;
  showDescription?: boolean;
  showButtons?: boolean;
  buttonCount?: number;
  fieldHeight?: number;
  fieldSpacing?: number;
}

const Loader: React.FC<LoaderProps> = ({
  type = "default",
  rows = 5,
  columns = 6,
  showHeader = true,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showAddButton = true,
  
  // Form loader props
  fields = 6,
  showTitle = true,
  showDescription = true,
  showButtons = true,
  buttonCount = 2,
  fieldHeight = 48,
  fieldSpacing = 24,
}) => {
  if (type === "table") {
    return (
      <TableSkeletonLoader
        rows={rows}
        columns={columns}
        showHeader={showHeader}
        showPagination={showPagination}
        showSearch={showSearch}
        showFilters={showFilters}
        showActions={showActions}
        showAddButton={showAddButton}
      />
    );
  }

  if (type === "form") {
    return (
      <FormSkeletonLoader
        fields={fields}
        showTitle={showTitle}
        showDescription={showDescription}
        showButtons={showButtons}
        buttonCount={buttonCount}
        fieldHeight={fieldHeight}
        fieldSpacing={fieldSpacing}
      />
    );
  }

  if (type === "spinner") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#274699]"></div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default Loader;
