"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import useTableOperations from "../../hooks/useTableOperations";
import useGetQuery from "../../hooks/getQuery.hook";
import { apiUrls } from "../../apis";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { UserManagementRouteGuard } from "../../components/PermissionGuard";
import apiClient from "../../apis/apiClient";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import DeleteModel from "../../components/DeletePopupModel/DeleteModel";
import moment from "moment";
function UserManagementContent() {
  const { messageApi } = useUIProvider();
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const { getQuery: getRolesQuery } = useGetQuery();

  const userPermissions = getUIPermissionsForModule(MODULES.ADMIN_MANAGEMENT);

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllUsersByRole("admin"),
    activeApiUrl: apiUrls.toggleActiveStatus("user"),
    pageSize: 10,
  });

  const loadRoles = useCallback(async () => {
    await getRolesQuery({
      url: apiUrls.getAllRoles + "?limit=null",
      onSuccess: (response: any) => {
        const rolesData = response?.roles;
        const roleOptions = rolesData.map((role: any) => ({
          value: role._id,
          label: role.roleName,
        }));

        console.log("Roles loaded successfully:", roleOptions);
        setRoles(roleOptions);
      },
      onFail: (error: any) => {
        messageApi.error("Failed to load roles for filtering.");
        console.error("Failed to load roles:", error);
      },
    });
  }, [getRolesQuery]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const columns = [
    { key: "userName", title: "Name", dataIndex: "userName", width: "200px" },
    {
      key: "mobileNumber",
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      width: "150px",
    },
    { key: "emailId", title: "Email Id", dataIndex: "emailId", width: "200px" },
    {
      key: "assignedRole",
      title: "Assigned Role",
      dataIndex: "assignedRole",
      width: "150px",
      render: (_: any, record: any) => record.assignedRole?.roleName || "N/A",
    },
    {
      key: "createdAt",
      title: "Created Date",
      dataIndex: "createdAt",
      width: "150px",
      render: (text: string, record: any) => {
        if (record.createdAt) {
          return moment(record.createdAt).format("DD/MM/YYYY");
        }
        return "N/A";
      },
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      width: "100px",
      render: (text: string, record: any) => (
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
      key: "profileImage",
      title: "Document",
      dataIndex: "profileImage",
      type: "profileImage" as const,
      width: "120px",
    },
  ];

  const filters = [
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      placeholder: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
      width: "120px",
    },
  ];

  const handleEdit = (record: any) => {
    router.push(`/dashboard/usermanagement/edit/${record._id}`);
  };

  // This function now shows the delete modal
  const handleDelete = (record: any) => {
    if (!record?._id) {
      return messageApi.error("Invalid user ID");
    }
    setItemToDelete(record);
    setIsBulkDelete(false);
    setDeleteModalVisible(true);
  };

  const handleBulkDelete = (selectedKeys: React.Key[]) => {
    setItemToDelete(selectedKeys);
    setIsBulkDelete(true);
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
        searchPlaceholder="Search by name..."
        // filters={filters}
        onSearch={tableOps.onSearch}
        onFilterChange={tableOps.onFilterChange}
        onClearFilter={tableOps.clearAll}
        title="Admin Management"
        addButtonText="Add Admin"
        addButtonLink="/dashboard/usermanagement/add"
        onEdit={userPermissions.canEdit ? handleEdit : undefined}
        // onDelete={userPermissions.canDelete ? handleDelete : undefined}
        onActive={tableOps.onActive}
        onBulkDelete={userPermissions.canDelete ? handleBulkDelete : undefined}
        selectable={true}
        selectedRowKeys={tableOps.selectedRowKeys}
        onSelectionChange={tableOps.onSelectionChange}
        showAddButton={userPermissions.canCreate}
        canDelete={userPermissions.canDelete}
        canEdit={userPermissions.canEdit}
        canCreate={userPermissions.canCreate}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <DeleteModel
          title={
            isBulkDelete
              ? `${itemToDelete?.length || 0} selected users`
              : `user "${itemToDelete?.userName}"`
          }
          onConfirm={async () => {
            try {
              if (isBulkDelete) {
                await tableOps.onBulkDelete(itemToDelete);
              } else {
                await apiClient.delete(
                  `${apiUrls.deleteUser}/${itemToDelete._id}`
                );
                messageApi.success("User deleted successfully");
                tableOps.refresh();
              }
              setDeleteModalVisible(false);
              setItemToDelete(null);
            } catch (error: any) {
              messageApi.error(error?.data?.message || "Failed to delete user");
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

export default function UserManagementPage() {
  return (
    <UserManagementRouteGuard>
      <UserManagementContent />
    </UserManagementRouteGuard>
  );
}
