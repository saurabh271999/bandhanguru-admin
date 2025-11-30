"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface EnhancedBreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
  className?: string;
  maxItems?: number;
  showEllipsis?: boolean;
}

const EnhancedBreadcrumbs: React.FC<EnhancedBreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  showHome = true,
  homeHref = "/dashboard",
  className = "",
  maxItems = 5,
  showEllipsis = true,
}) => {
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === items.length - 1;
    const isCurrent = item.current || isLast;

    const content = (
      <div className="flex items-center space-x-1">
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span
          className={`text-sm font-medium ${
            isCurrent ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {item.label}
        </span>
      </div>
    );

    if (item.href && !isCurrent) {
      return (
        <Link
          key={index}
          href={item.href}
          className="flex items-center space-x-1 transition-colors duration-150 hover:text-gray-700"
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        key={index}
        className={`flex items-center space-x-1 ${
          isCurrent ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {content}
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    let displayItems = items;

    // Handle max items with ellipsis
    if (items.length > maxItems && showEllipsis) {
      const firstItem = items[0];
      const lastItems = items.slice(-2); // Show last 2 items
      const middleItems = items.slice(1, -2);

      displayItems = [
        firstItem,
        ...(middleItems.length > 0 ? [{ label: "...", current: true }] : []),
        ...lastItems,
      ];
    }

    return displayItems.map((item, index) => (
      <React.Fragment key={index}>
        {renderBreadcrumbItem(item, index)}
        {index < displayItems.length - 1 && (
          <span className="flex-shrink-0 mx-2">{separator}</span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <nav
      className={`flex items-center space-x-1 ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link
            href={homeHref}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-150"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <span className="flex-shrink-0 mx-2">{separator}</span>
        </>
      )}
      {renderBreadcrumbs()}
    </nav>
  );
};

// Hook for generating breadcrumbs from pathname
export const useBreadcrumbs = (pathname: string) => {
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Convert segment to readable label
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  return generateBreadcrumbs();
};

// Preset breadcrumb configurations for common pages
export const breadcrumbPresets = {
  dashboard: [{ label: "Dashboard", current: true }],
  userManagement: [{ label: "Admin Management", current: true }],
  clientManagement: [{ label: "Agent Management", current: true }],
  projectManagement: [{ label: "Project Management", current: true }],
  addProject: [
    // { label: "Project Management", href: "/dashboard/projectmanagement" },
    // { label: "Add Project", current: true },
  ],
  editProject: [
    // { label: "Project Management", href: "/dashboard/projectmanagement" },
    // { label: "Edit Project", current: true },
  ],
  viewProject: [
    // { label: "Project Management", href: "/dashboard/projectmanagement" },
    // { label: "View Project", current: true },
  ],
  complaints: [
    // { label: "Complaints", current: true },
  ],
  installers: [{ label: "Installers", current: true }],
  roleManagement: [{ label: "Role Management", current: true }],
  categoryManagement: [{ label: "Category Management", current: true }],
  vendorManagement: [{ label: "Vendor Management", current: true }],
  notifications: [{ label: "Notifications", current: true }],
};

export default EnhancedBreadcrumbs;
