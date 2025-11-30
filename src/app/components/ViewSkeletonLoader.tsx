"use client";

import React from "react";
import { Spin } from "antd";

interface ViewSkeletonLoaderProps {
  showHeader?: boolean;
  showActions?: boolean;
  showMap?: boolean;
  showDocuments?: boolean;
  fieldCount?: number;
}

const ViewSkeletonLoader: React.FC<ViewSkeletonLoaderProps> = ({
  showHeader = true,
  showActions = true,
  showMap = false,
  showDocuments = false,
  fieldCount = 8,
}) => {
  return (
    <div className="p-6 bg-white min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default ViewSkeletonLoader;