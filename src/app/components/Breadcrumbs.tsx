// components/Breadcrumbs.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react"; // Make sure you have 'lucide-react' installed: npm install lucide-react

// Define the type for a single breadcrumb item
interface BreadcrumbItem {
  label: string;
  path: string;
}

// Props for the Breadcrumbs component
interface BreadcrumbsProps {
  // Optional: A custom list of breadcrumbs if you want to override auto-generation
  items?: BreadcrumbItem[];
  // Optional: A base path to start the breadcrumbs from (e.g., /dashboard)
  basePath?: string;
  // Optional: A mapping for path segments to display labels (e.g., 'usermanagement' -> 'Admin Management')
  labelMap?: { [key: string]: string };
  // Optional: An array of path segments to ignore when generating breadcrumbs
  skippedSegments?: string[];
}

// Default mappings for common path segments
const defaultLabelMap: { [key: string]: string } = {
  dashboard: "Dashboard", // Common mapping for the dashboard base
  home: "Home", // Alternative for root
  usermanagement: "Admin Management",
  rolemanagement: "Role Management",
  clientmanagement: "Agent Management",
  projectmanagement: "Project Management",
  projects: "Projects",
  add: "Add New", // e.g., for /users/add
  addnewuser: "Add New Admin", // Specific for your request
  edit: "Edit", // e.g., for /users/edit
  // Add more default mappings for your routes as needed
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  basePath = "/",
  labelMap = {},
  skippedSegments = [],
}) => {
  const pathname = usePathname();
  const mergedLabelMap = { ...defaultLabelMap, ...labelMap };
  const lowercasedSkippedSegments = useMemo(
    () => skippedSegments.map((s) => s.toLowerCase()),
    [skippedSegments]
  );

  const generatedItems: BreadcrumbItem[] = useMemo(() => {
    if (items) {
      return items; // If custom items are provided, use them directly
    }

    // Split pathname into segments, filter out empty strings and skipped segments
    const pathSegments = pathname
      .split("/")
      .filter(
        (segment) =>
          segment !== "" &&
          !lowercasedSkippedSegments.includes(segment.toLowerCase())
      );

    let currentPath = "";
    const breadcrumbList: BreadcrumbItem[] = [];

    // --- Add the Base Breadcrumb ---
    const effectiveBasePath = basePath.startsWith("/")
      ? basePath
      : `/${basePath}`; // Ensure starts with /
    const baseSegment = effectiveBasePath
      .split("/")
      .filter((s) => s !== "")
      .pop();

    // Only add base if it's not a skipped segment itself
    if (
      baseSegment &&
      !lowercasedSkippedSegments.includes(baseSegment.toLowerCase())
    ) {
      breadcrumbList.push({
        label:
          mergedLabelMap[baseSegment.toLowerCase()] ||
          capitalizeFirstLetter(baseSegment),
        path: effectiveBasePath,
      });
    } else if (!baseSegment && effectiveBasePath === "/") {
      // Fallback for root path if no specific base segment
      breadcrumbList.push({
        label: mergedLabelMap["home"] || "Home",
        path: "/",
      });
    }

    // --- Generate items from path segments ---
    pathSegments.forEach((segment, index) => {
      const lowerSegment = segment.toLowerCase();

      // Skip adding the base segment again if it's the first segment and already added
      if (index === 0 && lowerSegment === baseSegment?.toLowerCase()) {
        currentPath = effectiveBasePath; // Set currentPath to base path
        return; // Skip this iteration
      }

      // Avoid adding the base segment if the current path includes it already
      // This handles cases like /dashboard/dashboard/usermanagement
      if (
        currentPath === effectiveBasePath &&
        lowerSegment === baseSegment?.toLowerCase()
      ) {
        return;
      }

      currentPath = `${currentPath}/${segment}`; // Append the current segment to form the full path

      const label =
        mergedLabelMap[lowerSegment] ||
        capitalizeFirstLetter(segment.replace(/-/g, " "));

      // Add the breadcrumb if it's not a skipped segment (already filtered, but defensive)
      if (!lowercasedSkippedSegments.includes(lowerSegment)) {
        breadcrumbList.push({
          label: label,
          path: currentPath,
        });
      }
    });

    // --- Post-processing for potential duplicates (e.g., Home > Dashboard if Dashboard is also base) ---
    // If the path starts with a segment that is also the effective base, and we have redundant "Home/Dashboard > Dashboard"
    if (
      breadcrumbList.length > 1 &&
      breadcrumbList[0].path === effectiveBasePath
    ) {
      const firstItemLabel = breadcrumbList[0].label.toLowerCase();
      const secondItemLabel = breadcrumbList[1].label.toLowerCase();
      const effectiveBaseLabel =
        mergedLabelMap[baseSegment?.toLowerCase() || ""]?.toLowerCase() ||
        capitalizeFirstLetter(baseSegment || "").toLowerCase();

      // If the first breadcrumb is "Home" and the second is "Dashboard", and the basePath is "/dashboard"
      // And we want "Dashboard" to be the root.
      if (
        firstItemLabel === "home" &&
        secondItemLabel === "dashboard" &&
        effectiveBasePath === "/dashboard"
      ) {
        breadcrumbList.shift(); // Remove 'Home'
      }
    }

    return breadcrumbList;
  }, [pathname, items, basePath, mergedLabelMap, lowercasedSkippedSegments]);

  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string: string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <nav
      className="flex items-center text-xs sm:text-sm font-medium text-gray-500 overflow-hidden"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2 min-w-0">
        {generatedItems.map((item, index) => (
          <li
            key={item.path || `item-${index}`}
            className="inline-flex items-center flex-shrink-0"
          >
            {index > 0 && ( // Add separator before all but the first item
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />
            )}
            {index === generatedItems.length - 1 ? (
              // Current item (last one) - no link, just text, blue color to indicate current page
              <span className="text-[#274699] font-semibold truncate max-w-[120px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              // Other items - clickable links
              <Link
                href={item.path}
                className="text-gray-500 hover:text-blue-600 truncate max-w-[100px] sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
