"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { VendorManagementRouteGuard } from "../../components/PermissionGuard";
import { TableRecord } from "../../types";
import { apiUrls } from "../../apis";
import { useUIProvider } from "../../components/UiProvider/UiProvider";
import useGetQuery from "@/app/hooks/getQuery.hook";
import useTableOperations from "@/app/hooks/useTableOperations";
import usePatchQuery from "@/app/hooks/patchQuery.hook";
import { Button } from "antd";
import { Download } from "lucide-react";

function SubscribedVendorsContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const { messageApi } = useUIProvider();
  const PartsPermissions = getUIPermissionsForModule(MODULES.VENDOR_MANAGEMENT);
  const { getQuery } = useGetQuery();
  const { patchQuery } = usePatchQuery();
  const [subscribedVendors, setSubscribedVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const [accessDenied, setAccessDenied] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [downloadingInvoices, setDownloadingInvoices] = useState(false);
  const [selectionModeEnabled, setSelectionModeEnabled] = useState(false);

  // Function to transform subscriptions to vendor data
  const transformSubscriptions = (subscriptions: any[]) => {
    return subscriptions.map((subscription: any) => {
      const vendor = subscription?.vendorId || {};
      const subscriptionStatus = subscription.status || "inactive";
      return {
        ...vendor,
        _id: vendor._id || subscription._id,
        subscription: subscription,
        subscriptionId: subscription._id, // Store subscription ID for updates
        currentSubscription: subscription,
        // Add subscription fields at top level for easier access
        planName: subscription.planName,
        planType: subscription.planType,
        duration: subscription.duration,
        price: subscription.price,
        originalPrice: subscription.originalPrice,
        paymentStatus: subscription.paymentStatus,
        status: subscriptionStatus,
        endDate: subscription.endDate,
        daysRemaining: subscription.daysRemaining,
        // Use vendor's isActive field (true/false) for Switch toggle
        // isActive comes from vendor object - preserve false values, default to true only if undefined/null
        // This ensures: isActive=false shows Switch OFF, isActive=true shows Switch ON
        isActive: vendor.isActive !== undefined && vendor.isActive !== null 
          ? Boolean(vendor.isActive) 
          : true, // Default to true if not set
      };
    });
  };

  // Load vendors with paid subscriptions from API (fetch all pages)
  const loadSubscribedVendors = useCallback(async () => {
      try {
        setLoading(true);
        setAccessDenied(false);
        setAccessDeniedMessage("");
        
        // First, fetch page 1 to get total pages
        const firstPageResponse = await getQuery({
          url: `${apiUrls.getPaidSubscriptions}?page=1&limit=10`,
          onSuccess: () => {},
          onFail: (error: any) => {
            console.error("Failed to load paid subscriptions:", error);
            
            // Check if it's an access denied error
            const errorResponse = error?.response?.data || error?.data || {};
            if (error?.response?.status === 403 || errorResponse?.status === "failed") {
              const errorMessage = errorResponse?.message || "Access denied. Required roles: Admin, Super Admin";
              setAccessDenied(true);
              setAccessDeniedMessage(errorMessage);
              messageApi.error(errorMessage);
            } else {
              messageApi.error("Failed to load approved vendors");
            }
            
            setSubscribedVendors([]);
            setFilteredVendors([]);
          },
        });

        // Check if response indicates access denied
        if (firstPageResponse?.status === "failed" || firstPageResponse?.status === "error") {
          const errorMessage = firstPageResponse?.message || firstPageResponse?.error?.message || "Access denied. You don't have permission to view this page.";
          setAccessDenied(true);
          setAccessDeniedMessage(errorMessage);
          messageApi.error(errorMessage);
          setSubscribedVendors([]);
          setFilteredVendors([]);
          setLoading(false);
          return;
        }

        // Extract subscriptions and pagination from first page
        const firstPageSubscriptions = firstPageResponse?.subscriptions || firstPageResponse?.data?.subscriptions || [];
        const paginationInfo = firstPageResponse?.pagination || firstPageResponse?.data?.pagination || {};
        const totalPages = paginationInfo.totalPages || paginationInfo.total_pages || 1;

        // Transform first page
        let allVendors = transformSubscriptions(firstPageSubscriptions);

        // Fetch remaining pages if there are more
        for (let page = 2; page <= totalPages; page++) {
          try {
            const pageResponse = await getQuery({
              url: `${apiUrls.getPaidSubscriptions}?page=${page}&limit=10`,
              onSuccess: () => {},
              onFail: (error: any) => {
                console.error(`Failed to load page ${page}:`, error);
              },
            });

            if (pageResponse && pageResponse.status !== "failed" && pageResponse.status !== "error") {
              const pageSubscriptions = pageResponse?.subscriptions || pageResponse?.data?.subscriptions || [];
              const pageVendors = transformSubscriptions(pageSubscriptions);
              allVendors = [...allVendors, ...pageVendors];
            }
      } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            // Continue with next page even if one fails
          }
        }

        // Log isActive values for debugging
        console.log("Loaded vendors with isActive status:", 
          allVendors.map((v: any) => ({
            name: v.userName,
            id: v._id,
            isActive: v.isActive
          }))
        );

        setSubscribedVendors(allVendors);
        setFilteredVendors(allVendors);
        
        // Store pagination info from first page
        if (paginationInfo) {
          setPagination(paginationInfo);
        }
      } catch (error: any) {
        console.error("Error loading paid subscriptions:", error);
        
        // Check if it's an access denied error
        const errorResponse = error?.response?.data || error?.data || {};
        if (error?.response?.status === 403 || errorResponse?.status === "failed") {
          const errorMessage = errorResponse?.message || "Access denied. Required roles: Admin, Super Admin";
          setAccessDenied(true);
          setAccessDeniedMessage(errorMessage);
          messageApi.error(errorMessage);
        } else {
          messageApi.error("Failed to load approved vendors");
        }
        
        setSubscribedVendors([]);
        setFilteredVendors([]);
      } finally {
        setLoading(false);
      }
  }, [getQuery, messageApi]);

  // Load vendors on mount
  useEffect(() => {
    loadSubscribedVendors();
  }, [loadSubscribedVendors]);

  // Filter vendors based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      setFilteredVendors(subscribedVendors);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = subscribedVendors.filter((vendor: any) => {
      // Search in vendor data (which is at root level after transformation)
      // The vendor object is already transformed with vendor data at root
      const vendorName = (vendor.userName || "").toLowerCase();
      const businessName = (vendor.businessName || "").toLowerCase();
      const email = (vendor.emailId || "").toLowerCase();
      const mobile = (vendor.mobileNumber || "").toLowerCase();
      const agentName = (vendor.assignedAgent?.userName || "").toLowerCase();
      const agentCode = (vendor.assignedAgent?.agentCode || "").toLowerCase();
      const planName = (vendor.planName || vendor.subscription?.planName || "").toLowerCase();

      return (
        vendorName.includes(searchLower) ||
        businessName.includes(searchLower) ||
        email.includes(searchLower) ||
        mobile.includes(searchLower) ||
        agentName.includes(searchLower) ||
        agentCode.includes(searchLower) ||
        planName.includes(searchLower)
      );
    });

    setFilteredVendors(filtered);
  }, [searchTerm, subscribedVendors]);

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllVendorsAll,
    pageSize: 10,
    activeApiUrl: apiUrls.toggleActiveStatus("vendor"),
  });

  // Paginate the filtered vendors
  const paginatedData = filteredVendors.slice(
    (tableOps.currentPage - 1) * tableOps.pageSize,
    tableOps.currentPage * tableOps.pageSize
  );

  const columns = [
    {
      key: "agentName",
      title: "Advisor Name",
      dataIndex: "assignedAgent",
      width: "200px",
      render: (text: string, record: any) => {
        // Check subscription vendorId for assignedAgent if not at root
        const vendor = record.subscription?.vendorId || record.vendorId || record;
        const assignedAgent = vendor?.assignedAgent || record.assignedAgent;
        
        if (!assignedAgent?.userName) {
          return (
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
              No-Advisor
            </span>
          );
        }
        return assignedAgent.userName;
      },
    },
    {
      key: "agentCode",
      title: "Advisor Code",
      dataIndex: "assignedAgent",
      width: "160px",
      render: (text: string, record: any) => {
        // Check subscription vendorId for assignedAgent if not at root
        const vendor = record.subscription?.vendorId || record.vendorId || record;
        const assignedAgent = vendor?.assignedAgent || record.assignedAgent;
        
        if (!assignedAgent?._id) {
          return (
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
              No-Advisor
            </span>
          );
        }
        return (
          <Link
            href={`/dashboard/clientmanagement/viewclient?id=${assignedAgent._id}`}
            className="text-blue-500 underline"
          >
            {assignedAgent.agentCode || "-"}
          </Link>
        );
      },
    },
    {
      key: "userName",
      title: "Vendor Name",
      dataIndex: "userName",
      width: "200px",
    },
    {
      key: "businessName",
      title: "Business Name",
      dataIndex: "businessName",
      width: "220px",
    },
    {
      key: "emailId",
      title: "Email",
      dataIndex: "emailId",
      width: "250px",
    },
    {
      key: "mobileNumber",
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      width: "160px",
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      width: "150px",
      render: (text: any, record: any) => {
        const status = record.status || record.subscription?.status || "active";
        const statusLower = status?.toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusLower === "active"
                ? "bg-green-100 text-green-800"
                : statusLower === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    // {
    //   key: "isVerified",
    //   title: "Verified",
    //   dataIndex: "isVerified",
    //   width: "120px",
    //   render: (text: any, record: any) => {
    //     const isVerified = record.isVerified || false;
    //     return (
    //       <span
    //         className={`px-2 py-1 rounded-full text-xs font-medium ${
    //           isVerified
    //             ? "bg-green-100 text-green-800"
    //             : "bg-gray-100 text-gray-800"
    //         }`}
    //       >
    //         {isVerified ? "Yes" : "No"}
    //       </span>
    //     );
    //   },
    // },
    {
      key: "planName",
      title: "Plan Name",
      dataIndex: "subscription",
      width: "150px",
      render: (text: any, record: any) => {
        // Subscription is already at record.subscription or record.planName
        const planName = record.planName || record.subscription?.planName || record.currentSubscription?.planName;
        if (!planName) {
          return <span className="text-gray-500">No Plan</span>;
        }
        return (
          <span className="font-medium text-blue-600">
            {planName}
          </span>
        );
      },
    },
    {
      key: "planDuration",
      title: "Duration",
      dataIndex: "subscription",
      width: "120px",
      render: (text: any, record: any) => {
        const duration = record.duration || record.subscription?.duration || record.currentSubscription?.duration;
        return duration || "-";
      },
    },
    {
      key: "planPrice",
      title: "Price",
      dataIndex: "subscription",
      width: "120px",
      render: (text: any, record: any) => {
        const price = record.price || record.subscription?.price || record.currentSubscription?.price;
        const originalPrice = record.originalPrice || record.subscription?.originalPrice || record.currentSubscription?.originalPrice;
        
        if (price) {
          return `₹${price}`;
        }
        if (originalPrice) {
          return `₹${originalPrice}`;
        }
        return "-";
      },
    },
    {
      key: "planEndDate",
      title: "Plan End Date",
      dataIndex: "subscription",
      width: "150px",
      render: (text: any, record: any) => {
        const endDate = record.endDate || record.subscription?.endDate || record.currentSubscription?.endDate;
        
        if (!endDate) return "-";
        
        try {
          const date = new Date(endDate);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch {
          return "-";
        }
      },
    },
    {
      key: "daysRemaining",
      title: "Days Remaining",
      dataIndex: "subscription",
      width: "140px",
      render: (text: any, record: any) => {
        let daysRemaining = record.daysRemaining || record.subscription?.daysRemaining || record.currentSubscription?.daysRemaining;
        
        // Calculate if not provided
        if (daysRemaining === undefined) {
          const endDate = record.endDate || record.subscription?.endDate || record.currentSubscription?.endDate;
          if (endDate) {
            try {
              const end = new Date(endDate);
              const today = new Date();
              const diffTime = end.getTime() - today.getTime();
              daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (daysRemaining < 0) {
                return <span className="text-red-600">Expired</span>;
              }
            } catch {
              return "-";
            }
          } else {
            return "-";
          }
        }
        
        if (daysRemaining < 0) {
          return <span className="text-red-600">Expired</span>;
        }
            
            return (
              <span
                className={`font-medium ${
              daysRemaining > 30
                    ? "text-green-600"
                : daysRemaining > 7
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
            {daysRemaining} days
              </span>
            );
      },
    },
  ];

  const handleView = (record: TableRecord) => {
    // Get vendor ID from record (which is the transformed vendor data)
    // After transformation, vendor data is at root level, so _id should be there
    const vendorId = (record as any)._id || (record as any).id;
    if (vendorId) {
      router.push(`/dashboard/vendormanagement/view?id=${vendorId}`);
    }
  };

  const handleEdit = (record: TableRecord) => {
    // Get vendor ID from record (which is the transformed vendor data)
    // After transformation, vendor data is at root level, so _id should be there
    const vendorId = (record as any)._id || (record as any).id;
    if (vendorId) {
      router.push(`/dashboard/vendormanagement/edit/${vendorId}`);
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    // Custom page change handler for filtered data
    tableOps.onPageChange(page, pageSize);
  };

  // Custom handler to toggle vendor isActive status
  // Exact same pattern as useTableOperations.handleToggleActive but refreshes subscription data
  const handleActiveToggle = async (record: TableRecord) => {
    const vendorId = (record as any)._id || (record as any).id;
    if (!vendorId) {
      messageApi.error("Vendor ID not found");
      return;
    }

    // Use the vendor toggle-status endpoint
    patchQuery({
      url: apiUrls.toggleVendorStatus(vendorId),
      patchData: {
        isActive: !(record as any).isActive,
      },
      onSuccess: (res: any) => {
        messageApi.success(res.message || "Record updated successfully");
        // Refresh subscription data to show updated isActive status
        loadSubscribedVendors();
      },
      onFail: () => {
        messageApi.error("Failed to update status");
      },
    });
  };

  // Handle vendor selection
  const handleSelectionChange = (selectedKeys: string[]) => {
    setSelectedVendors(selectedKeys);
  };

  // Toggle selection mode and handle download
  const handleDownloadInvoiceClick = () => {
    if (!selectionModeEnabled) {
      // Enable selection mode
      setSelectionModeEnabled(true);
      messageApi.info("Selection mode enabled. Select vendors to download invoices.");
    } else {
      // If vendors are selected, download invoices
      if (selectedVendors.length > 0) {
        handleBulkInvoiceDownload();
      } else {
        messageApi.warning("Please select at least one vendor to download invoices");
      }
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedVendors.length === paginatedData.length) {
      // Deselect all
      setSelectedVendors([]);
    } else {
      // Select all
      const allIds = paginatedData.map((vendor: any) => vendor._id || vendor.id).filter(Boolean);
      setSelectedVendors(allIds);
    }
  };

  // Cancel selection mode
  const handleCancelSelection = () => {
    setSelectionModeEnabled(false);
    setSelectedVendors([]);
  };

  // Helper function to download a single invoice
  const downloadInvoice = async (
    invoiceUrl: string,
    fileName: string,
    vendorName: string,
    delay: number = 0
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Try to fetch as blob first (for CORS-enabled files)
          const response = await fetch(invoiceUrl, {
            mode: "cors",
            credentials: "omit",
          });

          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            // Use vendor name in filename for better organization
            const safeVendorName = vendorName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            link.setAttribute("download", `${safeVendorName}_${fileName}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            resolve();
            return;
          }
        } catch (error) {
          console.log("CORS fetch failed, trying alternative method:", error);
        }

        // Fallback: Try direct download
        try {
          const link = document.createElement("a");
          link.href = invoiceUrl;
          const safeVendorName = vendorName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
          link.download = `${safeVendorName}_${fileName}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          link.remove();
          resolve();
        } catch (fallbackError) {
          console.error("Fallback download failed:", fallbackError);
          // Final fallback: Open in new tab
          try {
            window.open(invoiceUrl, "_blank");
            resolve();
          } catch (finalError) {
            console.error("All download methods failed:", finalError);
            reject(finalError);
          }
        }
      }, delay);
    });
  };

  // Download invoices for selected vendors
  const handleBulkInvoiceDownload = async () => {
    if (selectedVendors.length === 0) {
      messageApi.warning("Please select at least one vendor to download invoices");
      return;
    }

    setDownloadingInvoices(true);
    messageApi.info(`Preparing to download invoices for ${selectedVendors.length} vendor(s)...`);

    try {
      // Get all vendors data from filteredVendors (which has subscription data)
      const selectedVendorRecords = filteredVendors.filter((vendor: any) => {
        const vendorId = vendor._id || vendor.id;
        return selectedVendors.includes(vendorId);
      });

      if (selectedVendorRecords.length === 0) {
        messageApi.error("Selected vendors not found in current data");
        setDownloadingInvoices(false);
        return;
      }

      // Collect invoice URLs from subscription data (already available in the records)
      const invoiceUrls: Array<{ url: string; vendorName: string; fileName: string }> = [];
      
      selectedVendorRecords.forEach((vendor: any) => {
        const subscription = vendor.subscription || vendor.currentSubscription;
        if (subscription?.invoicePdfUrl) {
          const vendorName = vendor.userName || vendor.businessName || "Unknown";
          const fileName = subscription.invoicePdfUrl.split("/").pop() || `invoice_${vendor._id || vendor.id}.pdf`;
          invoiceUrls.push({
            url: subscription.invoicePdfUrl,
            vendorName: vendorName,
            fileName: fileName,
          });
        }
      });

      if (invoiceUrls.length === 0) {
        messageApi.warning("No invoices found for selected vendors");
        setDownloadingInvoices(false);
        return;
      }

      // Download all invoices
      messageApi.info(`Downloading ${invoiceUrls.length} invoice(s)...`);
      
      for (let i = 0; i < invoiceUrls.length; i++) {
        const { url, vendorName, fileName } = invoiceUrls[i];
        try {
          await downloadInvoice(url, fileName, vendorName, i * 300); // Stagger downloads by 300ms
        } catch (error) {
          console.error(`Failed to download invoice for ${vendorName}:`, error);
        }
      }

      messageApi.success(`Successfully downloaded ${invoiceUrls.length} invoice(s)`);
      setSelectedVendors([]); // Clear selection after download
      setSelectionModeEnabled(false); // Disable selection mode after download
    } catch (error) {
      console.error("Error downloading invoices:", error);
      messageApi.error("Failed to download invoices. Please try again.");
    } finally {
      setDownloadingInvoices(false);
    }
  };

  // Show access denied message if API returned access denied error
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 border-2 border-red-300 rounded-full animate-ping opacity-75"></div>
            </div>

            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Access Denied
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {accessDeniedMessage || "You don't have the required permissions to access this page. Please contact your administrator if you believe this is an error."}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full cursor-pointer bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Go to Dashboard
                </span>
              </button>
            </div>

            <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-4 left-4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Error Code:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">403</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CommonTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        currentPage={tableOps.currentPage}
        pageSize={tableOps.pageSize}
        total={filteredVendors.length}
        onPageChange={handlePageChange}
        searchPlaceholder="Search approved vendors..."
        onSearch={(term: string) => {
          setSearchTerm(term);
          // Reset to first page when searching
          tableOps.onPageChange(1, tableOps.pageSize);
        }}
        title="Approved Vendors"
        addButtonText="Add Vendor"
        addButtonLink="/dashboard/vendormanagement/add"
        onView={handleView}
        onEdit={handleEdit}
        onActive={handleActiveToggle}
        selectable={selectionModeEnabled}
        selectedRowKeys={selectedVendors}
        onSelectionChange={handleSelectionChange}
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={false}
        showActions={true}
        showAddButton={true}
        canView={PartsPermissions.canView}
        canEdit={PartsPermissions.canEdit}
        canCreate={PartsPermissions.canCreate}
        canDelete={false}
        loaderType="table"
        loaderRows={5}
        loaderColumns={columns.length}
        customHeaderContent={
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                type={selectionModeEnabled ? "default" : "primary"}
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadInvoiceClick}
                loading={downloadingInvoices}
                className="h-10"
              >
                {selectionModeEnabled && selectedVendors.length > 0
                  ? `Download Invoices (${selectedVendors.length})`
                  : selectionModeEnabled
                  ? "Download Invoices"
                  : "Download Invoice"}
              </Button>
              
              {selectionModeEnabled && (
                <>
                  <Button
                    onClick={handleSelectAll}
                    className="h-10"
                  >
                    {selectedVendors.length === paginatedData.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <Button
                    onClick={handleCancelSelection}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            
            {selectionModeEnabled && (
              <span className="text-sm text-gray-600">
                {selectedVendors.length} of {paginatedData.length} vendor(s) selected
              </span>
            )}
          </div>
        }
      />
    </>
  );
}

export default function SubscribedVendors() {
  return (
    <VendorManagementRouteGuard>
      <SubscribedVendorsContent />
    </VendorManagementRouteGuard>
  );
}

