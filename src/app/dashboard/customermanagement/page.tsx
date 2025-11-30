"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import useTableOperations from "@/app/hooks/useTableOperations";
import { apiUrls } from "../../apis";

function CustomerManagementContent() {
  const router = useRouter();

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllUsersByRole("customer"),
    pageSize: 10,
    activeApiUrl: apiUrls.toggleActiveStatus("user"),
  });

  const columns = [
    {
      key: "mobileNumber",
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      width: "200px",
    },
    {
      key: "emailId",
      title: "Email",
      dataIndex: "emailId",
      width: "250px",
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      width: "120px",
      render: tableOps.renderStatusColumn,
    },
  ];

  const handleView = (record: any) => {
    try {
      router.push(
        `/dashboard/customermanagement/viewcustomer?id=${record.id || record._id}`
      );
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <>
      <CommonTable
        data={tableOps.data}
        columns={columns}
        loading={tableOps.loading}
        currentPage={tableOps.currentPage}
        pageSize={tableOps.pageSize}
        total={tableOps.total}
        onPageChange={tableOps.onPageChange}
        searchPlaceholder="Search customers..."
        onSearch={tableOps.onSearch}
        title="List Of Customers"
        onView={handleView}
        onActive={tableOps.onActive}
        selectable={false}
        selectedRowKeys={[]}
        onSelectionChange={() => {}}
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={false}
        showActions={true}
        showAddButton={false}
        canView={true}
        canEdit={false}
        canCreate={false}
        canDelete={false}
        loaderType="table"
        loaderRows={5}
        loaderColumns={columns.length}
      />
    </>
  );
}

export default function CustomerManagement() {
  return <CustomerManagementContent />;
}
