"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface TrendData {
  value: number;
  positive: boolean;
  period: string;
}

interface EnhancedStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: TrendData;
  color?: string;
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "bg-blue-50",
  subtitle,
  onClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            {trend && <div className="h-3 bg-gray-200 rounded w-20"></div>}
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center">
              <span className={`text-xs font-medium ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.positive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs {trend.period}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatsCard;
