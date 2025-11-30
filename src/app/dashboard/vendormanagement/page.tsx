"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { VendorManagementRouteGuard } from "../../components/PermissionGuard";
import { Input, Button } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { Vendor, TableRecord } from "../../types";
import usePostQuery from "../../hooks/postQuery.hook";
import { apiUrls } from "../../apis";
import { useUIProvider } from "../../components/UiProvider/UiProvider";
import useGetQuery from "@/app/hooks/getQuery.hook";
import useTableOperations from "@/app/hooks/useTableOperations";
import MediaUploader from "@/app/components/Uploader/mediaUploader";
import apiClient from "../../apis/apiClient";
import DeleteModel from "../../components/DeletePopupModel/DeleteModel";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: VendorFormData) => void;
}

interface VendorFormData {
  businessName: string;
  ownerDetails: string;
  servicesOffered: string;
  priceList: string;
  aadhaarNumber: string;
  panNumber: string;
  mapLocation: string; // Google Map link or coordinates
}

// Unused component - keeping for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: "",
    ownerDetails: "",
    servicesOffered: "",
    priceList: "",
    aadhaarNumber: "",
    panNumber: "",
    mapLocation: "",
  });

  // Media uploads
  const [aadhaarDoc, setAadhaarDoc] = useState<UploadFile[]>([]);
  const [panDoc, setPanDoc] = useState<UploadFile[]>([]);
  const [photos, setPhotos] = useState<UploadFile[]>([]);
  const [videos, setVideos] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { postQuery } = usePostQuery();
  const { messageApi } = useUIProvider();

  // No agent/user preloads required for the simplified vendor form

  const handleInputChange = (field: keyof VendorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // No phone handler needed

  const handleSubmit = async () => {
    if (!formData.businessName.trim())
      return messageApi.error("Business Name is required");
    if (!formData.ownerDetails.trim())
      return messageApi.error("Owner Details are required");

    setSubmitting(true);
    try {
      // Build payload with media URLs
      const payload = {
        ...formData,
        aadhaarDoc: aadhaarDoc.map((f) => f.url).filter(Boolean),
        panDoc: panDoc.map((f) => f.url).filter(Boolean),
        photos: photos.map((f) => f.url).filter(Boolean),
        videos: videos.map((f) => f.url).filter(Boolean),
      };

      // TODO: POST to vendor creation endpoint when available.
      onSubmit(payload);
      messageApi.success("Vendor details saved");
      onClose();
    } catch (error) {
      console.error("Error creating vendor:", error);
      messageApi.error("Failed to create vendor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/5 px-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg text-black">
        <h2 className="text-xl font-semibold text-center mb-4">
          Add New Vendor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Name & Owner Details */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Business Name *
            </label>
            <Input
              placeholder="Enter business name"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              size="large"
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Owner Details *
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Enter owner details"
              value={formData.ownerDetails}
              onChange={(e) =>
                handleInputChange("ownerDetails", e.target.value)
              }
            />
          </div>

          {/* Services/Products Offered */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Services/Products Offered
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe services/products offered"
              value={formData.servicesOffered}
              onChange={(e) =>
                handleInputChange("servicesOffered", e.target.value)
              }
            />
          </div>

          {/* Price List & Packages */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Price List & Packages
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Add price list or package details"
              value={formData.priceList}
              onChange={(e) => handleInputChange("priceList", e.target.value)}
            />
          </div>

          {/* Aadhaar & PAN Verification */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Aadhaar Number
            </label>
            <Input
              placeholder="Enter Aadhaar number"
              value={formData.aadhaarNumber}
              onChange={(e) =>
                handleInputChange("aadhaarNumber", e.target.value)
              }
              size="large"
              maxLength={12}
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              PAN Number
            </label>
            <Input
              placeholder="Enter PAN"
              value={formData.panNumber}
              onChange={(e) => handleInputChange("panNumber", e.target.value)}
              size="large"
              maxLength={10}
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MediaUploader
              label="Upload Aadhaar Document"
              accept="image/*,application/pdf"
              fileList={aadhaarDoc}
              onChange={setAadhaarDoc}
              type="document"
            />
            <MediaUploader
              label="Upload PAN Document"
              accept="image/*,application/pdf"
              fileList={panDoc}
              onChange={setPanDoc}
              type="document"
            />
          </div>

          {/* Photos & Videos */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MediaUploader
              label="Business Photos"
              accept="image/*"
              fileList={photos}
              onChange={setPhotos}
              type="image"
            />
            <MediaUploader
              label="Business Videos"
              accept="video/*"
              fileList={videos}
              onChange={setVideos}
              type="video"
            />
          </div>

          {/* Google Map Location */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Google Map Location
            </label>
            <Input
              placeholder="Paste Google Maps URL or coordinates"
              value={formData.mapLocation}
              onChange={(e) => handleInputChange("mapLocation", e.target.value)}
              size="large"
            />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 mt-2 flex space-x-4">
            <Button
              type="primary"
              className="flex-1 h-12 text-base font-medium"
              onClick={handleSubmit}
              loading={submitting}
              style={{ backgroundColor: "#274699" }}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
            <Button
              className="flex-1 h-12 text-base font-medium"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function VendorManagementContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const { messageApi } = useUIProvider();
  const PartsPermissions = getUIPermissionsForModule(MODULES.VENDOR_MANAGEMENT);
  const { getQuery } = useGetQuery();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // State for client-side advisor code search
  const [allVendorsData, setAllVendorsData] = useState<any[]>([]);
  const [isAdvisorCodeSearchActive, setIsAdvisorCodeSearchActive] = useState(false);

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllVendorsAll,
    pageSize: 10,
    activeApiUrl: apiUrls.toggleActiveStatus("vendor"),
  });

  useEffect(() => {
    console.log("Table data updated:", tableOps.data);
    console.log("Total records:", tableOps.total);
  }, [tableOps.data, tableOps.total]);

  const columns = [
    {
      key: "agentName",
      title: "Advisor Name",
      dataIndex: "assignedAgent",
      width: "200px",
      render: (text: string, record: TableRecord) => {
        const assignedAgent = record.assignedAgent as { userName?: string };
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
      render: (text: string, record: TableRecord) => {
        const assignedAgent = record.assignedAgent as {
          _id?: string;
          agentCode?: string;
        };
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
        const status = record.status || "pending";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status?.toLowerCase() === "approved"
                ? "bg-green-100 text-green-800"
                : status?.toLowerCase() === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // const filters = [
  //   {
  //     key: "agentCode",
  //     label: "Employee Code",
  //     type: "select" as const,
  //     placeholder: "Select employee code",
  //     width: "150px",
  //     options: [],
  //   },
  // ];

  const handleView = (record: TableRecord) => {
    router.push(`/dashboard/vendormanagement/view?id=${record._id}`);
  };

  const handleEdit = (record: TableRecord) => {
    router.push(`/dashboard/vendormanagement/edit/${record._id}`);
  };

  const handleDelete = (record: TableRecord) => {
    if (!record?._id && !record?.id) {
      return messageApi.error("Invalid vendor ID");
    }
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };

  // State for filtered advisor code search results
  const [advisorCodeSearchResults, setAdvisorCodeSearchResults] = useState<any[]>([]);

  // Load all vendors for client-side advisor code search
  const loadAllVendorsForSearch = async () => {
    if (allVendorsData.length > 0) return allVendorsData; // Use cached data

    return new Promise((resolve) => {
      getQuery({
        url: `${apiUrls.getAllVendorsAll}?limit=1000`, // Load more data for search
        onSuccess: (response: any) => {
          if (response?.vendors || response?.data?.vendors) {
            const vendors = response.vendors || response.data.vendors || [];
            setAllVendorsData(vendors);
            resolve(vendors);
          } else {
            resolve([]);
          }
        },
        onFail: (error: any) => {
          console.error("Failed to load all vendors:", error);
          resolve([]);
        },
      });
    });
  };

  // Enhanced search handler with client-side advisor code filtering
  const handleVendorSearch = async (searchTerm: string) => {
    console.log("Search triggered with term:", searchTerm);

    if (!searchTerm || searchTerm.trim() === "") {
      console.log("Empty search, clearing advisor code search");
      setIsAdvisorCodeSearchActive(false);
      setAdvisorCodeSearchResults([]);
      tableOps.onSearch(searchTerm);
      return;
    }

    const trimmedSearch = searchTerm.trim();
    const searchLower = trimmedSearch.toLowerCase();

    // Check if this looks like an advisor code search
    const looksLikeAdvisorCode = /^AGE\d+$/i.test(trimmedSearch) ||
                                 (searchLower.includes('age') && /\d/.test(trimmedSearch));

    console.log("Search term:", trimmedSearch, "Looks like advisor code:", looksLikeAdvisorCode);

    if (looksLikeAdvisorCode) {
      console.log("Performing advisor code search for:", trimmedSearch);
      setIsAdvisorCodeSearchActive(true);

      // Load all vendors for client-side filtering
      const allVendors = await loadAllVendorsForSearch() as any[];
      console.log("Loaded vendors:", allVendors.length);

      // Filter vendors by advisor code
      const filteredVendors = allVendors.filter((vendor: any) => {
        const assignedAgent = vendor.assignedAgent;
        const agentCode = assignedAgent?.agentCode || "";
        const matches = agentCode.toLowerCase().includes(searchLower);
        if (matches) {
          console.log("Found matching vendor:", vendor.userName, "with agent code:", agentCode);
        }
        return matches;
      });

      console.log("Filtered vendors:", filteredVendors.length);
      setAdvisorCodeSearchResults(filteredVendors);

      if (filteredVendors.length === 0) {
        messageApi.info(`No vendors found with advisor code "${trimmedSearch}". Please ensure the advisor code format is correct (e.g., AGE001).`);
      } else {
        messageApi.success(`Found ${filteredVendors.length} vendor(s) with advisor code containing "${trimmedSearch}"`);
      }
    } else {
      console.log("Performing regular search for:", trimmedSearch);
      setIsAdvisorCodeSearchActive(false);
      setAdvisorCodeSearchResults([]);
      // For regular searches, use the standard API search
      tableOps.onSearch(trimmedSearch);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddVendor = (newVendor: Vendor) => {
    tableOps.refresh();
  };

  // Test function to load and log all vendors (for debugging)
  const testLoadVendors = async () => {
    console.log("Testing vendor loading...");
    const vendors = await loadAllVendorsForSearch() as any[];
    console.log("All vendors loaded:", vendors);
    console.log("First few vendors with agent codes:");
    vendors.slice(0, 5).forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.userName} - Agent Code: ${vendor.assignedAgent?.agentCode || 'No agent code'}`);
    });
  };

  const handleFilterChange = (newFilters: Record<string, string | number>) => {
    console.log("Filter change triggered:", newFilters);
    tableOps.onFilterChange(newFilters);
  };

  return (
    <>
      <CommonTable
        data={isAdvisorCodeSearchActive ? advisorCodeSearchResults : tableOps.data}
        columns={columns}
        loading={tableOps.loading}
        currentPage={isAdvisorCodeSearchActive ? 1 : tableOps.currentPage}
        pageSize={isAdvisorCodeSearchActive ? advisorCodeSearchResults.length : tableOps.pageSize}
        total={isAdvisorCodeSearchActive ? advisorCodeSearchResults.length : tableOps.total}
        onPageChange={isAdvisorCodeSearchActive ? () => {} : tableOps.onPageChange}
        searchPlaceholder="Search vendors by name, email, business name, or advisor code (e.g., AGE001)..."
        // filters={filters}
        onSearch={handleVendorSearch}
        onFilterChange={handleFilterChange}
        onClearFilter={() => {
          setIsAdvisorCodeSearchActive(false);
          setAdvisorCodeSearchResults([]);
          tableOps.clearAll();
        }}
        title={isAdvisorCodeSearchActive ?
          `List Of Vendors (Advisor Code Search - ${advisorCodeSearchResults.length} results)` :
          "List Of Vendors"
        }
        addButtonText="Add Vendor"
        addButtonLink="/dashboard/vendormanagement/add"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={PartsPermissions.canDelete ? handleDelete : undefined}
        onActive={tableOps.onActive}
        selectable={true}
        selectedRowKeys={[]}
        onSelectionChange={() => {}}
        showHeader={true}
        showPagination={!isAdvisorCodeSearchActive}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showAddButton={true}
        canView={PartsPermissions.canView}
        canEdit={PartsPermissions.canEdit}
        canCreate={PartsPermissions.canCreate}
        canDelete={PartsPermissions.canDelete}
        loaderType="table"
        loaderRows={5}
        loaderColumns={columns.length}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <DeleteModel
          title={`vendor "${itemToDelete?.userName || itemToDelete?.businessName || ""}"`}
          onConfirm={async () => {
            try {
              const vendorId = itemToDelete._id || itemToDelete.id;
              await apiClient.delete(apiUrls.deleteVendor(vendorId));
              messageApi.success("Vendor deleted successfully");
              tableOps.refresh();
              setDeleteModalVisible(false);
              setItemToDelete(null);
            } catch (error: any) {
              messageApi.error(
                error?.data?.message || "Failed to delete vendor"
              );
            }
          }}
          onCancel={() => {
            setDeleteModalVisible(false);
            setItemToDelete(null);
          }}
        />
      )}
      {/* AddVendorModal removed in favor of dedicated page */}
    </>
  );
}

export default function VendorManagement() {
  return (
    <VendorManagementRouteGuard>
      <VendorManagementContent />
    </VendorManagementRouteGuard>
  );
}
