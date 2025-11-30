"use client";

import React, { useState } from "react";
import CommonTable from "./CommonTable";
import { Column, TableRecord } from "../types";

// Example data with documents
const sampleData: TableRecord[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    document: "https://example.com/document1.pdf",
    fileName: "contract.pdf",
    documentType: "PDF",
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    document: "", // No document
    fileName: "",
    documentType: "",
    uploadDate: "",
    fileSize: "",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    document: "https://example.com/document3.docx",
    fileName: "proposal.docx",
    documentType: "DOCX",
    uploadDate: "2024-01-20",
    fileSize: "1.8 MB",
  },
];

const CommonTableExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: Column[] = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      width: "200px",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: "250px",
    },
    {
      key: "document",
      title: "Document",
      dataIndex: "document",
      type: "document",
      fileNameIndex: "fileName",
      documentTypeIndex: "documentType",
      uploadDateIndex: "uploadDate",
      fileSizeIndex: "fileSize",
      width: "100px",
    },
  ];

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CommonTable with Document Columns Example</h1>
      
      <CommonTable
        data={sampleData}
        columns={columns}
        loading={false}
        currentPage={currentPage}
        pageSize={pageSize}
        total={sampleData.length}
        onPageChange={handlePageChange}
        title="Users with Documents"
        showSearch={true}
        showFilters={false}
        showPagination={true}
        showActions={false}
        showAddButton={false}
      />
    </div>
  );
};

export default CommonTableExample;
