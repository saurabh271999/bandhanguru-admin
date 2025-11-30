"use client";

import React from "react";
import { Spin } from "antd";

interface DashboardSkeletonLoaderProps {
  showStats?: boolean;
  showProjectTable?: boolean;
  showComplaintStatus?: boolean;
  showAlerts?: boolean;
}

const DashboardSkeletonLoader: React.FC<DashboardSkeletonLoaderProps> = ({
  showStats = true,
  showProjectTable = true,
  showComplaintStatus = true,
  showAlerts = true,
}) => {
  return (
    <div className="p-6 bg-white min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default DashboardSkeletonLoader;