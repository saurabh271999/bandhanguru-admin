"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import useTableOperations from "../../hooks/useTableOperations";
import { apiUrls } from "../../apis";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { RoleManagementRouteGuard } from "../../components/PermissionGuard";
import DeleteModel from "../../components/DeletePopupModel/DeleteModel";
import { useUIProvider } from "../../components/UiProvider/UiProvider";

function RoleManagementContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const { messageApi } = useUIProvider();

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Get UI permissions for role management
  const rolePermissions = getUIPermissionsForModule(MODULES.ROLE_MANAGEMENT);

  // Table operations hook
  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllRoles,
    pageSize: 10,
    initialFilters: {},
    activeApiUrl: apiUrls.toggleActiveStatus("role"),
    onSuccess: (response: any) => {
      console.log("Roles loaded successfully", response);
    },
    onError: (error: any) => {
      console.error("Failed to load roles", error);
    },
  });

  // Table columns configuration
  const columns = [
    {
      key: "roleName",
      title: "Role Name",
      dataIndex: "roleName",
      width: "200px",
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
      width: "300px",
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
    {
      key: "isDefault",
      title: "Default",
      dataIndex: "isDefault",
      width: "100px",
      render: (text: any, record: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            record.isDefault
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {record.isDefault ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  // Filter configuration
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      placeholder: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      width: "195px",
    },
  ];

  // Handle edit role
  const handleEdit = (record: any) => {
    router.push(`/dashboard/rolemanagement/edit/${record.id || record._id}`);
  };

  // Handle bulk delete
  const handleBulkDelete = (selectedKeys: any) => {
    setItemToDelete(selectedKeys);
    setIsBulkDelete(true);
    setDeleteModalVisible(true);
  };

  return (
    <div className="p-1 md:p-3">
      <CommonTable
        // Data
        data={tableOps.data}
        columns={columns}
        loading={tableOps.loading && tableOps.data.length === 0}
        // Pagination
        currentPage={tableOps.currentPage}
        pageSize={tableOps.pageSize}
        total={tableOps.total}
        onPageChange={tableOps.onPageChange}
        // Search & Filters
        searchPlaceholder="Search roles..."
        filters={filters}
        onSearch={tableOps.onSearch}
        onFilterChange={tableOps.onFilterChange}
        onClearFilter={tableOps.clearAll}
        // Actions
        title="Role Management"
        addButtonText="Add Role"
        addButtonLink="/dashboard/rolemanagement/add"
        onEdit={handleEdit}
        // onDelete={handleDelete}
        onActive={tableOps.onActive}
        onBulkDelete={handleBulkDelete}
        // Selection
        selectable={true}
        selectedRowKeys={tableOps.selectedRowKeys}
        onSelectionChange={tableOps.onSelectionChange}
        // Customization
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showAddButton={true}
        // Permissions
        canEdit={rolePermissions.canEdit}
        canDelete={rolePermissions.canDelete}
        canCreate={rolePermissions.canCreate}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <DeleteModel
          title={
            isBulkDelete
              ? `${itemToDelete?.length || 0} selected roles`
              : `role "${itemToDelete?.roleName}"`
          }
          onConfirm={async () => {
            try {
              if (isBulkDelete) {
                await tableOps.onBulkDelete(itemToDelete);
                messageApi.success(
                  `Successfully deleted ${itemToDelete.length} roles`
                );
              } else {
                await tableOps.onDelete(itemToDelete);
                messageApi.success(
                  `Successfully deleted role: ${itemToDelete.roleName}`
                );
              }
              setDeleteModalVisible(false);
              setItemToDelete(null);
            } catch (error) {
              console.error("Delete operation failed:", error);
              messageApi.error("Failed to delete role(s)");
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

export default function RoleManagement() {
  return (
    <RoleManagementRouteGuard>
      <RoleManagementContent />
    </RoleManagementRouteGuard>
  );
}
