"use client";
import React from "react";

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  height = "1rem",
  width = "100%",
  rounded = false,
  animate = true,
}) => {
  const style = {
    height: typeof height === "number" ? `${height}px` : height,
    width: typeof width === "number" ? `${width}px` : width,
  };

  return (
    <div
      className={`bg-gray-200 ${rounded ? "rounded-full" : "rounded"} ${
        animate ? "animate-pulse" : ""
      } ${className}`}
      style={style}
    />
  );
};

// Dashboard Stats Skeleton
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton height="1rem" width="60%" className="mb-2" />
            <Skeleton height="2rem" width="40%" className="mb-2" />
            <Skeleton height="0.75rem" width="80%" />
          </div>
          <Skeleton height="3rem" width="3rem" rounded />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
    {/* Table Header */}
    <div className="flex gap-4 mb-4">
      <Skeleton height="2.5rem" width="300px" />
      <Skeleton height="2.5rem" width="150px" />
      <Skeleton height="2.5rem" width="150px" />
      <Skeleton height="2.5rem" width="100px" />
    </div>
    
    {/* Table Rows */}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              height="1.5rem"
              width={colIndex === 0 ? "200px" : "120px"}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Card Skeleton
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="space-y-3">
      <Skeleton height="1.5rem" width="60%" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? "40%" : "100%"}
        />
      ))}
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
      ))}
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <Skeleton height="2.5rem" width="2.5rem" rounded />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
          <Skeleton height="1.5rem" width="4rem" />
        </div>
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="space-y-4">
      <Skeleton height="1.5rem" width="40%" />
      <div className="h-64 flex items-end justify-between space-x-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            height={`${Math.random() * 200 + 50}px`}
            width="2rem"
          />
        ))}
      </div>
    </div>
  </div>
);

// Page Skeleton
export const PageSkeleton: React.FC = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton height="2rem" width="200px" />
      <Skeleton height="2.5rem" width="120px" />
    </div>
    
    {/* Stats Cards */}
    <StatsSkeleton />
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TableSkeleton rows={4} columns={3} />
      <CardSkeleton lines={4} />
    </div>
  </div>
);

export default Skeleton;
