"use client";
import React, { useState, useMemo } from "react";
import { Table, Input, Select, Button, Empty, Card } from "antd";
import { Search, Filter, X, Eye, Edit, Trash2, Download } from "lucide-react";

interface Filter {
  key: string;
  label: string;
  type: "input" | "select";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  width?: number;
}

interface EnhancedCommonTableProps {
  data: any[];
  columns: any[];
  title: string;
  loading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  searchPlaceholder?: string;
  filters?: Filter[];
  onSearch?: (value: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onClearFilters?: () => void;
  searchFontSize?: string;
  pagination?: any;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: React.ReactNode;
  rowSelection?: any;
  scroll?: any;
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  showHeader?: boolean;
  sticky?: boolean;
}

const EnhancedCommonTable: React.FC<EnhancedCommonTableProps> = ({
  data,
  columns,
  title,
  loading = false,
  showSearch = true,
  showFilters = true,
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  onClearFilters,
  searchFontSize = "15px",
  pagination = { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
  emptyStateTitle = "No data available",
  emptyStateDescription = "There are no records to display at the moment.",
  emptyStateIcon,
  rowSelection,
  scroll,
  size = "middle",
  bordered = false,
  showHeader = true,
  sticky = false,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setFilterValues({});
    onClearFilters?.();
  };

  const hasActiveFilters =
    searchValue ||
    Object.values(filterValues).some(
      (value) => value !== undefined && value !== ""
    );

  const renderFilter = (filter: Filter) => {
    const commonProps = {
      placeholder: filter.placeholder || filter.label,
      style: { width: "100%", height: 40 },
      value: filterValues[filter.key],
    };

    if (filter.type === "input") {
      return (
        <Input
          key={filter.key}
          {...commonProps}
          prefix={<Search size={16} />}
          allowClear
          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
        />
      );
    }

    if (filter.type === "select") {
      return (
        <Select
          key={filter.key}
          {...commonProps}
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={filter.options}
          onChange={(value) => handleFilterChange(filter.key, value)}
        />
      );
    }

    return null;
  };

  const tableColumns = useMemo(() => {
    const enhancedColumns = columns.map((col) => ({
      ...col,
      className: "text-sm",
    }));

    // Add action column if not present
    const hasActionColumn = enhancedColumns.some(
      (col) => col.key === "actions" || col.title === "Actions"
    );
    if (!hasActionColumn) {
      enhancedColumns.push({
        title: "Actions",
        key: "actions",
        width: 120,
        fixed: "right" as const,
        className: "text-center",
        render: (_: any, record: any) => (
          <div className="flex items-center justify-center space-x-2">
            <Button
              type="text"
              size="small"
              icon={<Eye size={14} />}
              className="text-blue-600 hover:text-blue-800"
              title="View"
            />
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              className="text-green-600 hover:text-green-800"
              title="Edit"
            />
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            />
          </div>
        ),
      });
    }

    return enhancedColumns;
  }, [columns]);

  const renderEmptyState = () => (
    <Empty
      image={emptyStateIcon}
      imageStyle={{ height: 60 }}
      description={
        <div className="text-center">
          <p className="text-gray-500 text-base font-medium">
            {emptyStateTitle}
          </p>
          <p className="text-gray-400 text-sm mt-1">{emptyStateDescription}</p>
        </div>
      }
    />
  );

  return (
    <Card className="shadow-sm border-0">
      <div className="p-4">
        <div className="flex mb-4 justify-between items-center flex-col sm:flex-row gap-2 sm:gap-0">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              icon={<X size={16} />}
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700 w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>

        {/* Enhanced Filter Section */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {showSearch && (
            <div className="w-full sm:w-[250px] md:w-[300px] lg:w-[350px]">
              <Input
                placeholder={loading ? "Loading..." : searchPlaceholder}
                prefix={<Search size={16} />}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
                style={{ height: 40, fontSize: searchFontSize }}
                disabled={loading}
                allowClear
              />
            </div>
          )}

          {showFilters &&
            filters.map((filter) => (
              <div key={filter.key} className="w-full sm:w-[150px]">
                {renderFilter(filter)}
              </div>
            ))}
        </div>

        {/* Enhanced Table */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 mt-2">Loading data...</p>
              </div>
            </div>
          )}

          <Table
            columns={tableColumns}
            dataSource={data}
            loading={false} // We handle loading state manually
            pagination={pagination}
            rowSelection={rowSelection}
            scroll={scroll}
            size={size}
            bordered={bordered}
            showHeader={showHeader}
            sticky={sticky}
            locale={{ emptyText: renderEmptyState() }}
            rowClassName="hover:bg-gray-50 transition-colors duration-150"
            className="enhanced-table"
          />
        </div>
      </div>
    </Card>
  );
};

export default EnhancedCommonTable;
