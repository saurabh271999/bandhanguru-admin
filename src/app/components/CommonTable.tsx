"use client";
import React, { useMemo, useState } from "react";
import { Edit, Trash2, Search, Eye, Info } from "lucide-react";
import { Input, Select, Button, Pagination, Tooltip, Switch } from "antd";
import Link from "next/link";
import { Modal } from "antd";
// import { ExclamationCircleOutlined } from "@ant-design/icons";
import DeleteModel from "./DeletePopupModel/DeleteModel";
import DocumentInfoModal from "./DocumentInfoModal";
// import { downloadDocument } from "../utils/documentUtils";
import {
  Column,
  Filter,
  TableRecord,
  TableActionHandler,
  SearchHandler,
  FilterHandler,
  PageChangeHandler,
  SelectionChangeHandler,
  ClearFilters,
} from "../types";
import _ from "lodash";
import ActiveModal from "./ActiveModal/ActiveModal";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { confirm } = Modal;

interface CommonTableProps {
  // Data
  data: TableRecord[];
  columns: Column[];
  loading?: boolean;

  // Pagination
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: PageChangeHandler;

  // Search & Filters
  searchPlaceholder?: string;
  searchWidth?: string;
  searchFontSize?: string;
  filters?: Filter[];
  onSearch?: SearchHandler;
  onFilterChange?: FilterHandler;
  onClearFilter?: ClearFilters;

  // Actions
  title?: string;
  addButtonText?: string;
  addButtonLink?: string;
  onAdd?: () => void;
  onView?: TableActionHandler;
  onEdit?: TableActionHandler;
  onDelete?: TableActionHandler;
  onActive?: TableActionHandler;
  onBulkDelete?: (selectedKeys: string[]) => void;

  // Selection
  selectable?: boolean;
  selectedRowKeys?: string[];
  onSelectionChange?: SelectionChangeHandler;

  // Customization
  className?: string;
  showHeader?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;

  // Loader customization
  loaderType?: "table" | "spinner" | "default";
  loaderRows?: number;
  loaderColumns?: number;

  // Permissions
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
}

const CommonTable: React.FC<CommonTableProps> = ({
  data: rawData = [],
  columns = [],
  loading = false,
  currentPage = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  searchPlaceholder = "Search...",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchWidth,
  searchFontSize,
  filters = [],
  onSearch,
  onFilterChange,
  onClearFilter = () => {},
  title = "Data Table",
  addButtonText = "Add New",
  addButtonLink,
  onAdd,
  onView, // Destructure new prop
  onEdit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loaderType = "table",
  loaderRows = 5,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loaderColumns,
  onDelete,
  onActive,
  onBulkDelete,
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showHeader = true,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showAddButton = true,
  canView = true, // Destructure new prop with a default value
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<
    Record<string, string | number>
  >({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>(selectedRowKeys);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activeModalVisible, setActiveModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TableRecord | null>(
    null
  );
  const [recordToActive, setRecordToActive] = useState<TableRecord | null>(
    null
  );
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [documentInfo, setDocumentInfo] = useState<{
    url?: string;
    fileName?: string;
    documentType?: string;
    uploadDate?: string;
    fileSize?: string;
  } | null>(null);

  const data = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

  const debouncedSearch = useMemo(
    () =>
      _.debounce((val: string) => {
        if (onSearch && (val.length === 0 || val.length >= 3)) {
          onSearch(val);
        }
      }, 500),
    [onSearch]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (
    key: string,
    value: string | number | boolean
  ) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters as Record<string, string | number>);
    // Call the external filter function immediately
    if (onFilterChange) {
      onFilterChange(newFilters as Record<string, string | number>);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectionChange = (selectedRowKeys: string[]) => {
    setSelectedKeys(selectedRowKeys);
    onSelectionChange?.(selectedRowKeys);
  };

  const handleBulkDelete = () => {
    if (selectedKeys.length > 0) {
      onBulkDelete?.(selectedKeys);
    }
  };

  const clearFilters = () => {
    setSearchValue("");
    setFilterValues({});
    // Call external functions to clear everything
    if (onClearFilter) {
      onClearFilter();
    }
    if (onFilterChange) {
      onFilterChange({});
    }
    if (onSearch) {
      onSearch(""); // Also clear the search
    }
  };

  const debouncedFilterChange = useMemo(
    () =>
      _.debounce((key: string, value: string) => {
        // Only call external filter function if it exists
        // Only trigger API call if value is empty (to clear) or has 3+ characters
        if (onFilterChange && (value.length === 0 || value.length >= 3)) {
          const newFilters = { ...filterValues, [key]: value };
          onFilterChange(newFilters);
        }
      }, 500),
    [filterValues, onFilterChange]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    filter: Filter
  ) => {
    let value = e.target.value;

    // For mobile numbers, allow only digits and trigger immediately
    if (filter.key === "mobileNumber") {
      value = value.replace(/\D+/g, "");
    }

    // Update UI state immediately (keeps cursor/focus stable)
    setFilterValues(
      (prev) =>
        ({
          ...prev,
          [filter.key]: value,
        } as Record<string, string | number>)
    );

    if (filter.key === "mobileNumber") {
      // Trigger external filter immediately for mobile number
      if (onFilterChange) {
        const newFilters = { ...filterValues, [filter.key]: value };
        onFilterChange(newFilters as Record<string, string | number>);
      }
      return;
    }

    // For other inputs, use debounced filtering
    debouncedFilterChange(filter.key, value);
  };

  const handleDeleteClick = (record: TableRecord) => {
    setRecordToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete && onDelete) {
      onDelete(recordToDelete);
    }
    setDeleteModalVisible(false);
    setRecordToDelete(null);
  };
  const handleActiveConfirm = () => {
    if (recordToActive && onActive) {
      onActive(recordToActive);
    }
    setActiveModalVisible(false);
    setRecordToActive(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setRecordToDelete(null);
  };
  const handleActiveCancel = () => {
    setActiveModalVisible(false);
    setRecordToActive(null);
  };

  const handleDocumentInfoClick = (record: TableRecord, column: Column) => {
    const documentData = record[column.dataIndex];

    // Handle both single documents and arrays of documents
    let documentUrl: string | undefined;
    let fileName: string | undefined;
    let documentType: string | undefined;
    let uploadDate: string | undefined;
    let fileSize: string | undefined;

    // Check if this is a profile image column
    if (column.type === "profileImage") {
      const profileImageUrl =
        record.profileImage || record.userProfile || record.profile;
      if (
        profileImageUrl &&
        typeof profileImageUrl === "string" &&
        profileImageUrl !== "null" &&
        profileImageUrl !== "undefined"
      ) {
        setDocumentInfo({
          url: profileImageUrl,
          fileName: "Profile Image",
          documentType: "image",
          uploadDate:
            (record.createdAt as string) || (record.updatedAt as string),
          fileSize: undefined,
        });
        setDocumentModalVisible(true);
        return;
      }
    }

    if (Array.isArray(documentData) && documentData.length > 0) {
      // If it's an array, take the first document
      const firstDoc = documentData[0];
      documentUrl = firstDoc.url || firstDoc.documentUrl;
      fileName = firstDoc.name || firstDoc.fileName || firstDoc.documentName;
      documentType = firstDoc.type || firstDoc.documentType;
      uploadDate = firstDoc.uploadDate;
      fileSize = firstDoc.fileSize;
    } else if (typeof documentData === "string") {
      // If it's a direct URL string
      documentUrl = documentData;
      fileName = column.fileNameIndex
        ? (record[column.fileNameIndex] as string)
        : undefined;
      documentType = column.documentTypeIndex
        ? (record[column.documentTypeIndex] as string)
        : undefined;
      uploadDate = column.uploadDateIndex
        ? (record[column.uploadDateIndex] as string)
        : undefined;
      fileSize = column.fileSizeIndex
        ? (record[column.fileSizeIndex] as string)
        : undefined;
    } else if (documentData && typeof documentData === "object") {
      // If it's a single document object
      const docData = documentData as Record<string, unknown>;
      documentUrl = (docData.url as string) || (docData.documentUrl as string);
      fileName =
        (docData.name as string) ||
        (docData.fileName as string) ||
        (docData.documentName as string);
      documentType =
        (docData.type as string) || (docData.documentType as string);
      uploadDate = docData.uploadDate as string;
      fileSize = docData.fileSize as string;
    }

    setDocumentInfo({
      url: documentUrl,
      fileName,
      documentType,
      uploadDate,
      fileSize,
    });
    setDocumentModalVisible(true);
  };

  const handleDocumentModalCancel = () => {
    setDocumentModalVisible(false);
    setDocumentInfo(null);
  };

  // Helper function to handle document downloads
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDocumentDownload = (documentUrl: string, fileName?: string) => {
    if (!documentUrl) return;

    try {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = fileName || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const renderFilter = (filter: Filter) => {
    switch (filter.type) {
      case "input":
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filterValues[filter.key] || ""}
            onChange={(e) => handleInputChange(e, filter)}
            style={{ width: "100%", height: 40 }}
            disabled={loading}
            className="placeholder:text-xs"
            inputMode={filter.key === "mobileNumber" ? "numeric" : undefined}
            pattern={filter.key === "mobileNumber" ? "[0-9]*" : undefined}
            maxLength={filter.key === "mobileNumber" ? 15 : undefined}
          />
        );
      case "select":
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filterValues[filter.key]}
            onChange={(value) =>
              handleFilterChange(filter.key, value as string | number)
            }
            style={{ width: "100%", height: 40 }}
            options={filter.options || []}
            allowClear
            disabled={loading}
            className="placeholder:text-xs"
          />
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (record: TableRecord) => {
    setRecordToActive(record);
    setActiveModalVisible(true);
  };

  // 3. Updated renderActions function to include the View icon
  const renderActions = (record: TableRecord) => {
    return (
      <div className="flex items-center flex justify-center space-x-3">
        {onView && (
          <Tooltip
            title={
              canView ? "View Details" : "You don't have permission to view"
            }
          >
            <button
              className={`text-[18px] cursor-pointer transition-colors ${
                canView
                  ? "text-blue-600 hover:text-blue-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => canView && onView(record)}
              disabled={!canView}
            >
              <Eye size={18} />
            </button>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip
            title={canEdit ? "Edit" : "You don't have permission to edit"}
          >
            <button
              className={`text-[18px] transition-colors cursor-pointer ${
                canEdit
                  ? "text-yellow-600 hover:text-yellow-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => canEdit && onEdit(record)}
              disabled={!canEdit}
            >
              <Edit size={18} />
            </button>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip
            title={canDelete ? "Active" : "You don't have permission to active"}
          >
            <button
              className={`text-[18px] cursor-pointer transition-colors ${
                canDelete
                  ? "text-red-600 hover:text-red-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => canDelete && handleDeleteClick(record)}
              disabled={!canDelete}
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        )}
        {onActive && (
          <Tooltip title={record?.isActive ? "Deactivate" : "Activate"}>
            <Switch
              checked={Boolean(record?.isActive)}
              onChange={() => handleStatusChange(record)}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className={`flex-1 bg-white flex flex-col ${className}`}>
      {/* Delete Modal */}
      {deleteModalVisible && (
        <DeleteModel
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          title={String(
            recordToDelete?.name || recordToDelete?.title || "item"
          )}
        />
      )}

      {/* active modal */}
      {activeModalVisible && (
        <ActiveModal
          onConfirm={handleActiveConfirm}
          onCancel={handleActiveCancel}
          title={String(
            recordToDelete?.name || recordToDelete?.title || "item"
          )}
          active={Boolean(recordToActive?.isActive)}
        />
      )}

      {/* Document Info Modal */}
      {documentModalVisible && documentInfo && (
        <DocumentInfoModal
          visible={documentModalVisible}
          onCancel={handleDocumentModalCancel}
          documentUrl={documentInfo.url}
          fileName={documentInfo.fileName}
          documentType={documentInfo.documentType}
          uploadDate={documentInfo.uploadDate}
          fileSize={documentInfo.fileSize}
        />
      )}

      <div className="flex-1 p-1 overflow-x-hidden">
        <div className="w-full  h-full flex flex-col">
          <div className="p-0 md:p-3">
            <div className="flex mb-4 justify-between items-center text-black">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="flex gap-2 mb-3 text-sm flex-wrap text-black">
              {showSearch && (
                <div className="w-full sm:w-[250px] md:w-[300px] lg:w-[350px]">
                  <Input
                    placeholder={loading ? "Loading..." : searchPlaceholder}
                    prefix={<Search size={20} />}
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                    style={{ height: 40, fontSize: searchFontSize || "15px" }}
                    disabled={loading}
                  />
                </div>
              )}

              {showFilters &&
                filters.map((filter) => (
                  <div key={filter.key} className="w-full sm:w-[150px]">
                    {renderFilter(filter)}
                  </div>
                ))}

              {showFilters && filters.length > 0 && (
                <div className="w-full">
                  <Button
                    onClick={clearFilters}
                    style={{ height: 40 }}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </div>
              )}

              {selectable &&
                selectedKeys.length > 0 &&
                onBulkDelete &&
                canDelete && (
                  <Button
                    danger
                    onClick={handleBulkDelete}
                    style={{ height: 40 }}
                  >
                    Delete Selected ({selectedKeys.length})
                  </Button>
                )}

              {showAddButton && canCreate && (
                <span className="flex justify-end w-full">
                  {addButtonLink ? (
                    <Link href={addButtonLink}>
                      <Button
                        type="primary"
                        style={{ height: 40, backgroundColor: "#274699" }}
                      >
                        + {addButtonText}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="primary"
                      onClick={onAdd}
                      style={{ height: 40, backgroundColor: "#274699" }}
                    >
                      + {addButtonText}
                    </Button>
                  )}
                </span>
              )}
            </div>

            <div
              className={`overflow-x-auto  border text-black border-gray-200 relative ${
                loading ? "pointer-events-none" : ""
              }`}
            >
              <table className="min-w-full text-sm text-left">
                <thead className="bg-[#E2F2C3] text-black font-semibold">
                  <tr>
                    {/* {selectable && (
                      <th className="p-2">
                        <Checkbox
                          checked={
                            selectedKeys.length === data.length &&
                            data.length > 0
                          }
                          indeterminate={
                            selectedKeys.length > 0 &&
                            selectedKeys.length < data.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleSelectionChange(
                                data.map((item) => item.id || item._id)
                              );
                            } else {
                              handleSelectionChange(
                                selectedKeys.filter((k) => k !== key)
                              );
                            }
                          }}
                        />
                      </th>
                    )} */}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="p-2"
                        style={{ width: column.width }}
                      >
                        <div className="flex justify-between items-center w-[120px] md:w-full">
                          <span>{column.title}</span>
                          {/* Optional: Add icons or buttons here */}
                        </div>
                      </th>
                    ))}
                    {/* 4. Updated column rendering logic to show if any action is present */}
                    {showActions &&
                      (onView || onEdit || onDelete || onActive) && (
                        <th
                          className="p-2 text-center"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Actions
                        </th>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Show skeleton loader rows when loading
                    Array.from({ length: loaderRows }).map((_, index) => (
                      <tr
                        key={`skeleton-${index}`}
                        className="border-t border-gray-200"
                      >
                        {columns.map((column) => (
                          <td
                            key={`skeleton-${index}-${column.key}`}
                            className="p-2"
                          >
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </td>
                        ))}
                        {showActions && (onView || onEdit || onDelete) && (
                          <td
                            key={`skeleton-${index}-actions`}
                            className="p-2"
                            style={{ width: "120px", minWidth: "120px" }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="animate-pulse">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                              </div>
                              <div className="animate-pulse">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                              </div>
                              <div className="animate-pulse">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    // Show empty state without the icon and "No data found" text
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (showActions ? 1 : 0)
                        }
                        className="p-6 text-center"
                      >
                        <div className="text-gray-500 text-sm">
                          No data available
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((record, index) => (
                      <tr
                        key={record.id || record._id || index}
                        className="border-t p-3 text-[10px] border-gray-200 hover:bg-gray-50"
                      >
                        {/* {selectable && (
                          <td className="p-2">
                            <Checkbox
                              checked={selectedKeys.includes(
                                record.id || record._id
                              )}
                              onChange={(e) => {
                                const key = record.id || record._id;
                                if (e.target.checked) {
                                  handleSelectionChange([...selectedKeys, key]);
                                } else {
                                  handleSelectionChange(
                                    selectedKeys.filter((k) => k !== key)
                                  );
                                }
                              }}
                            />
                          </td>
                        )} */}
                        {columns.map((column) => (
                          <td key={column.key} className="p-2 text-[.82rem]">
                            {column.render
                              ? (column.render(
                                  record[column.dataIndex] as string,
                                  record,
                                  index
                                ) as React.ReactNode)
                              : (() => {
                                  const value = record[column.dataIndex];

                                  // Special handling for document columns
                                  if (column.type === "document") {
                                    return (
                                      <Tooltip title="View Document Information">
                                        <button
                                          onClick={() =>
                                            handleDocumentInfoClick(
                                              record,
                                              column
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-1 rounded-full hover:bg-blue-50"
                                        >
                                          <Info size={16} />
                                        </button>
                                      </Tooltip>
                                    );
                                  }

                                  // Special handling for profile image columns
                                  if (column.type === "profileImage") {
                                    const profileImageUrl =
                                      record.profileImage ||
                                      record.userProfile ||
                                      record.profile;
                                    if (
                                      profileImageUrl &&
                                      profileImageUrl !== "null" &&
                                      profileImageUrl !== "undefined"
                                    ) {
                                      return (
                                        <Tooltip title="View Document Information">
                                          <button
                                            onClick={() =>
                                              handleDocumentInfoClick(
                                                record,
                                                column
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-1 rounded-full hover:bg-blue-50"
                                          >
                                            <Info size={16} />
                                          </button>
                                        </Tooltip>
                                      );
                                    } else {
                                      return (
                                        <span className="text-gray-400 text-xs">
                                          No Document
                                        </span>
                                      );
                                    }
                                  }

                                  if (
                                    typeof value === "object" &&
                                    value !== null
                                  ) {
                                    return JSON.stringify(
                                      value
                                    ) as React.ReactNode;
                                  }
                                  return value as React.ReactNode;
                                })()}
                          </td>
                        ))}
                        {showActions &&
                          (onView || onEdit || onDelete || onActive) && (
                            <td
                              className="p-2"
                              style={{ width: "120px", minWidth: "120px" }}
                            >
                              {renderActions(record)}
                            </td>
                          )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showPagination && total > 0 && (
            <div className="flex items-center justify-end mt-3 space-x-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
                showSizeChanger
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
                itemRender={(page, type, originalElement) => {
                  if (type === "page") {
                    const totalPages = Math.ceil(total / pageSize);

                    // Always show first page
                    if (page === 1) {
                      return originalElement;
                    }

                    // Show second page if it exists
                    if (page === 2 && totalPages >= 2) {
                      return originalElement;
                    }

                    // Show last page if it's different from first two
                    if (page === totalPages && totalPages > 2) {
                      return originalElement;
                    }

                    // Show current page if it's between 3 and totalPages-1
                    if (page === currentPage && page > 2 && page < totalPages) {
                      return originalElement;
                    }

                    // Show ellipsis for pages between 2 and last page
                    if (page === 3 && totalPages > 4) {
                      return (
                        <span className="ant-pagination-item-ellipsis">
                          •••
                        </span>
                      );
                    }

                    // Don't show other pages
                    return null;
                  }
                  return originalElement;
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonTable;
