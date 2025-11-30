"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CommonTable from "../../components/CommonTable";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES } from "../../utils/permissions";
import useTableOperations from "@/app/hooks/useTableOperations";
import { apiUrls } from "../../apis";
import { TableRecord } from "../../types";

function AdvisorApplicationContent() {
  const router = useRouter();
  const { getUIPermissionsForModule } = usePermissions();
  const AdvisorApplicationPermissions = getUIPermissionsForModule(
    MODULES.AGENT_MANAGEMENT // Using AGENT_MANAGEMENT as reference for advisor applications
  );

  const tableOps = useTableOperations({
    apiUrl: apiUrls.getAllAdvisorForms,
    pageSize: 10,
    activeApiUrl: apiUrls.toggleActiveStatus("advisor-form"),
  });

  const columns = [
    {
      key: "fullName",
      title: "Name",
      dataIndex: "fullName",
      width: "200px",
    },
    {
      key: "mobileNumber",
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      width: "160px",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: "250px",
    },
    {
      key: "roleApplyingFor",
      title: "Role Applied For",
      dataIndex: "roleApplyingFor",
      width: "180px",
      render: (text: string): React.ReactNode => {
        if (!text) return "-";
        // Convert snake_case to Title Case
        return text
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") as React.ReactNode;
      },
    },
    {
      key: "submittedAt",
      title: "Submitted At",
      dataIndex: "submittedAt",
      width: "180px",
      render: (text: string, record: TableRecord): React.ReactNode => {
        const dateToUse = text || record.createdAt;
        if (!dateToUse) return "-";
        const date = new Date(dateToUse as string);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) as React.ReactNode;
      },
    },
  ];

  const handleView = (record: TableRecord) => {
    // Navigate to view page - update route as needed
    router.push(`/dashboard/advisorApplication/view?id=${record._id}`);
  };

  const filters = [
    {
      key: "mobileNumber",
      label: "Mobile Number",
      type: "input" as const,
      placeholder: "Search by mobile",
      width: "180px",
    },
  ];

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
        searchPlaceholder="Search by name, email, or mobile number..."
        filters={filters}
        onSearch={tableOps.onSearch}
        onFilterChange={tableOps.onFilterChange}
        onClearFilter={tableOps.clearAll}
        title="Advisor Applications"
        onView={handleView}
        selectable={false}
        selectedRowKeys={[]}
        onSelectionChange={() => {}}
        showHeader={true}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showAddButton={false}
        canView={AdvisorApplicationPermissions.canView}
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

export default function AdvisorApplication() {
  return <AdvisorApplicationContent />;
}

