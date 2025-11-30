import { useState, useEffect, useCallback, useRef } from "react";
import useGetQuery from "./getQuery.hook.js";
import useDeleteQuery from "./deleteQuery.hook.js";
import usePatchQuery from "./patchQuery.hook.js";
import { toast } from "react-toastify";
import { useUIProvider } from "../components/UiProvider/UiProvider.tsx";

const useTableOperations = (config) => {
  const {
    apiUrl,
    deleteApiUrl,
    activeApiUrl,
    pageSize = 10,
    initialFilters = {},
    onSuccess,
    onError,
  } = config;

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const { messageApi } = useUIProvider();

  // API hooks
  const { getQuery, loading, error } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();
  const { patchQuery, loading: patchLoading } = usePatchQuery();

  // Simple flag to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const hasInitiallyFetchedRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Create a stable fetch function that doesn't depend on callbacks
  const stableFetchData = useCallback(async () => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    const params = {
      page: currentPage,
      limit: pageSizeState,
    };

    // Only add search parameter if it has a value
    if (searchValue && searchValue.trim() !== "") {
      params.search = searchValue;
    }

    // Only add filter parameters if they have values
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params[key] = filters[key];
      }
    });

    const queryString = new URLSearchParams(params).toString();
    const url = `${apiUrl}?${queryString}`;

    try {
      const result = await getQuery({
        url,
        onSuccess: (response) => {
          if (response?.success || response?.status === "success" || response) {
            // Handle different API response structures
            let dataArray = [];
            let totalCount = 0;

            if (response.roles) {
              dataArray = response.roles;
              totalCount =
                response.pagination?.totalRoles || response.roles.length;
            } else if (response.users) {
              dataArray = response.users;
              totalCount =
                response.pagination?.totalUsers || response.users.length;
            } else if (response.clients) {
              dataArray = response.clients;
              totalCount =
                response.pagination?.totalClients || response.clients.length;
            } else if (
              response.vendors ||
              (response.data && response.data.vendors)
            ) {
              // Vendors API (supports both root and data wrapper)
              const vendorsArr =
                response.vendors || response.data.vendors || [];
              const pagObj =
                response.pagination || response.data?.pagination || {};
              dataArray = vendorsArr;
              totalCount = pagObj.totalVendors || vendorsArr.length;
            } else if (
              response._id &&
              (response.userName || response.clientName)
            ) {
              dataArray = [response];
              totalCount = 1;
            } else if (
              Array.isArray(response) &&
              response.length > 0 &&
              response[0]._id
            ) {
              dataArray = response;
              totalCount = response.length;
            } else if (response.projects) {
              dataArray = response.projects;
              totalCount =
                response.pagination?.totalProjects || response.projects.length;
            } else if (response.complaints) {
              dataArray = response.complaints;
              totalCount =
                response.pagination?.totalComplaints ||
                response.complaints.length;
            } else if (response.installers) {
              dataArray = response.installers;
              totalCount =
                response.pagination?.totalInstallers ||
                response.installers.length;
            } else if (
              response.users &&
              response.users.some((user) => user.role === "installer")
            ) {
              dataArray = response.users.filter(
                (user) => user.role === "installer"
              );
              totalCount = response.pagination?.totalUsers || dataArray.length;
            } else if (response.parts) {
              dataArray = response.parts;
              totalCount =
                response.pagination?.totalParts || response.parts.length;
            } else if (response.categories) {
              dataArray = response.categories;
              totalCount =
                response.pagination?.totalCategories ||
                response.categories.length;
            } else if (response.data && response.data.docs) {
              // Handle mongoose-paginate-v2 response structure (advisor forms)
              dataArray = response.data.docs;
              totalCount = response.data.totalDocs || response.data.docs.length;
            } else {
              // Fallback
              if (response.data && Array.isArray(response.data)) {
                dataArray = response.data;
                totalCount = response.pagination?.total || response.data.length;
              } else if (
                response.data &&
                typeof response.data === "object" &&
                !Array.isArray(response.data)
              ) {
                dataArray = [response.data];
                totalCount = 1;
              } else if (Array.isArray(response)) {
                dataArray = response;
                totalCount = response.length;
              } else {
                dataArray = [];
                totalCount = 0;
              }
            }

            setData(dataArray);
            setTotal(totalCount);
            onSuccessRef.current?.(response);
          }
        },
        onFail: (err) => {
          onErrorRef.current?.(err);
        },
      });

      return result;
    } finally {
      isFetchingRef.current = false;
    }
  }, [apiUrl, currentPage, pageSizeState, searchValue, filters, getQuery]);

  // Backward compatibility fetch (kept for reference)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const params = { page: currentPage, limit: pageSizeState };
    if (searchValue && searchValue.trim() !== "") params.search = searchValue;
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params[key] = filters[key];
      }
    });

    const queryString = new URLSearchParams(params).toString();
    const url = `${apiUrl}?${queryString}`;

    try {
      const result = await getQuery({
        url,
        onSuccess: (response) => {
          if (response?.success || response?.status === "success" || response) {
            let dataArray = [];
            let totalCount = 0;

            if (response.roles) {
              dataArray = response.roles;
              totalCount =
                response.pagination?.totalRoles || response.roles.length;
            } else if (response.users) {
              dataArray = response.users;
              totalCount =
                response.pagination?.totalUsers || response.users.length;
            } else if (response.clients) {
              dataArray = response.clients;
              totalCount =
                response.pagination?.totalClients || response.clients.length;
            } else if (
              response.vendors ||
              (response.data && response.data.vendors)
            ) {
              const vendorsArr =
                response.vendors || response.data.vendors || [];
              const pagObj =
                response.pagination || response.data?.pagination || {};
              dataArray = vendorsArr;
              totalCount = pagObj.totalVendors || vendorsArr.length;
            } else if (
              response._id &&
              (response.userName || response.clientName)
            ) {
              dataArray = [response];
              totalCount = 1;
            } else if (
              Array.isArray(response) &&
              response.length > 0 &&
              response[0]._id
            ) {
              dataArray = response;
              totalCount = response.length;
            } else if (response.projects) {
              dataArray = response.projects;
              totalCount =
                response.pagination?.totalProjects || response.projects.length;
            } else if (response.complaints) {
              dataArray = response.complaints;
              totalCount =
                response.pagination?.totalComplaints ||
                response.complaints.length;
            } else if (response.installers) {
              dataArray = response.installers;
              totalCount =
                response.pagination?.totalInstallers ||
                response.installers.length;
            } else if (
              response.users &&
              response.users.some((user) => user.role === "installer")
            ) {
              dataArray = response.users.filter(
                (user) => user.role === "installer"
              );
              totalCount = response.pagination?.totalUsers || dataArray.length;
            } else if (response.parts) {
              dataArray = response.parts;
              totalCount =
                response.pagination?.totalParts || response.parts.length;
            } else if (response.categories) {
              dataArray = response.categories;
              totalCount =
                response.pagination?.totalCategories ||
                response.categories.length;
            } else if (response.data && response.data.docs) {
              // Handle mongoose-paginate-v2 response structure (advisor forms)
              dataArray = response.data.docs;
              totalCount = response.data.totalDocs || response.data.docs.length;
            } else {
              if (response.data && Array.isArray(response.data)) {
                dataArray = response.data;
                totalCount = response.pagination?.total || response.data.length;
              } else if (
                response.data &&
                typeof response.data === "object" &&
                !Array.isArray(response.data)
              ) {
                dataArray = [response.data];
                totalCount = 1;
              } else if (Array.isArray(response)) {
                dataArray = response;
                totalCount = response.length;
              } else {
                dataArray = [];
                totalCount = 0;
              }
            }

            setData(dataArray);
            setTotal(totalCount);
            onSuccessRef.current?.(response);
          }
        },
        onFail: (err) => onErrorRef.current?.(err),
      });
      return result;
    } finally {
      isFetchingRef.current = false;
    }
  }, [apiUrl, currentPage, pageSizeState, searchValue, filters, getQuery]);

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((page, size) => {
    setCurrentPage(page);
    setPageSizeState(size);
  }, []);

  const handleSelectionChange = useCallback((selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  }, []);

  const handleDelete = useCallback(
    async (record) => {
      const id = record.id || record._id;
      if (!id) {
        toast.error("Record ID not found");
        return;
      }

      const result = await deleteQuery({
        url: `${deleteApiUrl || apiUrl}/${id}`,
        onSuccess: () => {
          toast.success("Record deleted successfully");
          stableFetchData();
        },
        onFail: () => {
          toast.error("Failed to delete record");
        },
      });

      return result;
    },
    [deleteQuery, deleteApiUrl, apiUrl, stableFetchData]
  );

  const handleToggleActive = useCallback(
    async (record) => {
      const id = record.id || record._id;
      if (!id) {
        toast.error("Record ID not found");
        return;
      }

      const result = await patchQuery({
        url: `${activeApiUrl}/${id}`,
        onSuccess: (res) => {
          messageApi.success(res.message || "Record updated successfully");
          stableFetchData();
        },
        onFail: () => {
          messageApi.error("Failed to update status");
        },
        patchData: {
          isActive: !record?.isActive,
        },
      });

      return result;
    },
    [stableFetchData, activeApiUrl, patchQuery, messageApi]
  );

  const handleBulkDelete = useCallback(
    async (selectedKeys) => {
      if (selectedKeys.length === 0) {
        toast.warning("No records selected");
        return;
      }

      const promises = selectedKeys.map((key) =>
        deleteQuery({
          url: `${deleteApiUrl || apiUrl}/${key}`,
          onSuccess: () => {},
          onFail: () => {},
        })
      );

      try {
        await Promise.all(promises);
        toast.success(`${selectedKeys.length} records deleted successfully`);
        setSelectedRowKeys([]);
        stableFetchData();
      } catch {
        toast.error("Some records failed to delete");
      }
    },
    [deleteQuery, deleteApiUrl, apiUrl, stableFetchData]
  );

  const clearAll = useCallback(() => {
    setSearchValue("");
    setFilters({});
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, []);

  const renderStatusColumn = useCallback(
    (text, record) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          record.isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {record.isActive ? "Active" : "Inactive"}
      </span>
    ),
    []
  );

  useEffect(() => {
    if (!hasInitiallyFetchedRef.current) {
      hasInitiallyFetchedRef.current = true;
      stableFetchData();
    }
  }, [stableFetchData]);

  useEffect(() => {
    if (hasInitiallyFetchedRef.current) {
      stableFetchData();
    }
  }, [currentPage, pageSizeState, filters, stableFetchData]);

  const safeData = Array.isArray(data) ? data : [];

  return {
    data: safeData,
    total,
    loading,
    error,
    deleteLoading,
    patchLoading,
    currentPage,
    pageSize: pageSizeState,
    onPageChange: handlePageChange,
    searchValue,
    filters,
    onSearch: handleSearch,
    onFilterChange: handleFilterChange,
    clearAll,
    selectedRowKeys,
    onSelectionChange: handleSelectionChange,
    onDelete: handleDelete,
    onBulkDelete: handleBulkDelete,
    onActive: handleToggleActive,
    renderStatusColumn,
    refresh: stableFetchData,
  };
};

export default useTableOperations;
