"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import { CategoryManagementRouteGuard } from "../../components/PermissionGuard";
import { apiUrls } from "../../apis/index";
import { Filter } from "../../types";
import useTableOperations from "@/app/hooks/useTableOperations";

function CategoryManagementContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const categoryPermissions = getUIPermissionsForModule(
    MODULES.CATEGORY_MANAGEMENT
  );

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllCategories,
    activeApiUrl: apiUrls.toggleActiveStatus("category"),
    pageSize: 10,
  });

  const filters: Filter[] = [
    // {
    //   key: "category_id",
    //   label: "Category ID",
    //   type: "input",
    //   placeholder: "ID",
    //   width: "200px",
    // },
    {
      key: "category_name",
      label: "Category Name",
      type: "input",
      placeholder: "Name",
      width: "200px",
    },
  ];

  const columns = [
    // {
    //   key: "category_id",
    //   title: "Category ID",
    //   dataIndex: "category_id",
    //   width: "200px",
    // },
    {
      key: "category_name",
      title: "Category Name",
      dataIndex: "category_name",
      width: "300px",
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      width: "80px",
      render: tableOps.renderStatusColumn,
    },
  ];

  const handleEdit = (record: any) => {
    router.push(`/dashboard/categorymanagement/edit/${record._id}`);
  };

  const handleView = (record: any) => {
    // Use MongoDB document _id (or generic id) for manage route
    const mongoId = record._id || record.id;
    if (mongoId) {
      router.push(`/dashboard/categorymanagement/${mongoId}/manage`);
    } else {
      // Fallback: do nothing if _id is not available to avoid invalid id errors
      console.warn(
        "Missing _id for category record. Cannot navigate to manage page."
      );
    }
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
        searchPlaceholder="Search all columns..."
        onSearch={tableOps.onSearch}
        // filters={filters}
        onFilterChange={tableOps.onFilterChange}
        onClearFilter={tableOps.clearAll}
        title="List Of Category"
        addButtonText="Add Category"
        addButtonLink="/dashboard/categorymanagement/add"
        // onEdit={handleEdit}
        onView={handleView}
        onActive={tableOps.onActive}
        selectable={true}
        selectedRowKeys={[]}
        onSelectionChange={() => {}}
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showAddButton={true}
        canView={categoryPermissions.canView}
        canEdit={categoryPermissions.canEdit}
        canCreate={categoryPermissions.canCreate}
        canDelete={categoryPermissions.canDelete}
        loaderType="table"
        loaderRows={5}
        loaderColumns={columns.length}
      />
    </div>
  );
}

export default function CategoryManagement() {
  return (
    <CategoryManagementRouteGuard>
      <CategoryManagementContent />
    </CategoryManagementRouteGuard>
  );
}
