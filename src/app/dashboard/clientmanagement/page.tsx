"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import useTableOperations from "../../hooks/useTableOperations";
import { apiUrls } from "../../apis";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { ClientManagementRouteGuard } from "../../components/PermissionGuard";
import apiClient from "../../apis/apiClient";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import DeleteModel from "../../components/DeletePopupModel/DeleteModel";

function ClientManagementContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const { messageApi } = useUIProvider();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const clientPermissions = getUIPermissionsForModule(MODULES.AGENT_MANAGEMENT);

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllUsersByRole("agent"),
    pageSize: 10,
    activeApiUrl: apiUrls.toggleActiveStatus("user"),
    // Add role filter in the query parameters
  });

  const columns = [
    // {
    //   key: "select_admin",
    //   title: "Manager/Admin",
    //   dataIndex: "select_admin",
    //   width: "200px",
    // },
    {
      key: "userName",
      title: "Name",
      dataIndex: "userName",
      width: "200px",
    },
    {
      key: "agentCode",
      title: "Employee Code",
      dataIndex: "agentCode",
      width: "200px",
    },
    {
      key: "select_agent",
      title: "Role",
      dataIndex: "select_agent",
      width: "150px",
      render: (text: any, record: any) => {
        const role = record.select_agent || "N/A";
        const isStateHead = role.toLowerCase().includes("state head");

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isStateHead
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      key: "phone",
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      width: "150px",
    },
    {
      key: "email",
      title: "Email Id",
      dataIndex: "emailId",
      width: "250px",
    },

    // {
    //   key: "address",
    //   title: "Address",
    //   dataIndex: "address",
    //   width: "300px",
    //   render: (value: object) => {
    //     return <span>{Object.values(value).join(', ')}</span>
    //   }
    // },

    {
      key: "createdAt",
      title: "Created Date",
      dataIndex: "createdAt",
      width: "150px",
      render: (text: any, record: any) => {
        if (record.createdAt) {
          return new Date(record.createdAt).toLocaleDateString("en-GB");
        }
        return "N/A";
      },
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      width: "100px",
      render: (text: any, record: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            record.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {record.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const filters = [
    // {
    //   key: "mobileNumber",
    //   label: "Mobile Number",
    //   type: "input" as const,
    //   placeholder: "Mobile Number",
    //   width: "150px",
    // },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      placeholder: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      width: "100px",
    },
  ];
  const handleView = (record: any) => {
    try {
      router.push(
        `/dashboard/clientmanagement/viewclient?id=${record.id || record._id}`
      );
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleEdit = (record: any) => {
    router.push(`/dashboard/clientmanagement/edit/${record.id || record._id}`);
  };

  const handleDelete = (record: any) => {
    if (!record?._id && !record?.id) {
      return messageApi.error("Invalid advisor ID");
    }
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };

  return (
    <div>
      <CommonTable
        data={tableOps.data}
        columns={columns}
        loading={tableOps.loading}
        currentPage={tableOps.currentPage}
        pageSize={tableOps.pageSize}
        total={tableOps.total}
        onPageChange={tableOps.onPageChange}
        searchPlaceholder="Search Advisor..."
        filters={filters}
        onSearch={tableOps.onSearch}
        onFilterChange={tableOps.onFilterChange}
        onClearFilter={tableOps.clearAll}
        title="Advisor Management"
        addButtonText="Add Advisor"
        addButtonLink="/dashboard/clientmanagement/add"
        onEdit={handleEdit}
        onDelete={clientPermissions.canDelete ? handleDelete : undefined}
        onActive={tableOps.onActive}
        onView={handleView}
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showAddButton={true}
        canEdit={clientPermissions.canEdit}
        canCreate={clientPermissions.canCreate}
        canDelete={clientPermissions.canDelete}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <DeleteModel
          title={`advisor "${itemToDelete?.userName || itemToDelete?.fullName || ""}"`}
          onConfirm={async () => {
            try {
              const advisorId = itemToDelete._id || itemToDelete.id;
              await apiClient.delete(`${apiUrls.deleteUser}/${advisorId}`);
              messageApi.success("Advisor deleted successfully");
              tableOps.refresh();
              setDeleteModalVisible(false);
              setItemToDelete(null);
            } catch (error: any) {
              messageApi.error(
                error?.data?.message || "Failed to delete advisor"
              );
            }
          }}
          onCancel={() => {
            setDeleteModalVisible(false);
            setItemToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default function ClientManagement() {
  return (
    <ClientManagementRouteGuard>
      <ClientManagementContent />
    </ClientManagementRouteGuard>
  );
}
