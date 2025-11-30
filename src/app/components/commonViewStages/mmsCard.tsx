"use client";
import React, { useState, useEffect } from "react";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { Select } from "antd";
import moment from "moment";

interface MMSField {
  key: string;
  label: string;
  show: boolean;
  type?: "text" | "date" | "document" | "dropdown" | "time";
  value?: string;
  options?: string[];
}

interface MMSCardProps {
  title: string;
  fields: MMSField[];
  currentDetails: any;
  // MMS dropdown functionality
  mmsData?: any[];
  onMmsChange?: (mmsId: string) => void;
  selectedMmsId?: string;
  // Dispatch dropdown functionality
  dispatchData?: any[];
  onDispatchChange?: (dispatchId: string) => void;
  selectedDispatchId?: string;
  // Field visibility controls
  showMMSNumber?: boolean;
  showDate?: boolean;
  showDocument?: boolean;
  showStartTime?: boolean;
  showEndTime?: boolean;
  showPreQualityReport?: boolean;
  showDispatchNumber?: boolean;
  showBillNumber?: boolean;
  showDispatchFile?: boolean;
  showNameOfInstaller?: boolean;
  showFixingStartDate?: boolean;
  showTargetDate?: boolean;
  showCompletionDate?: boolean;
  showManpowerUsed?: boolean;
  showPhrFile?: boolean;
  showChrFile?: boolean;
  // Custom styling
  customTitle?: string;
  customHeaderColor?: string;
  customBorderColor?: string;
}

export default function CommonCard({
  title,
  fields,
  currentDetails,
  // MMS dropdown functionality
  mmsData,
  onMmsChange,
  selectedMmsId,
  // Dispatch dropdown functionality
  dispatchData,
  onDispatchChange,
  selectedDispatchId,
  // Field visibility defaults
  showMMSNumber = true,
  showDate = true,
  showDocument = true,
  showStartTime = true,
  showEndTime = true,
  showPreQualityReport = true,
  showDispatchNumber = true,
  showBillNumber = true,
  showDispatchFile = true,
  showNameOfInstaller = true,
  showFixingStartDate = true,
  showTargetDate = true,
  showCompletionDate = true,
  showManpowerUsed = true,
  showPhrFile = true,
  showChrFile = true,
  // Custom styling
  customTitle,
  customHeaderColor = "bg-[#274699]",
  customBorderColor = "border-gray-200"
}: MMSCardProps) {
  // State to track selected MMS and Dispatch data
  const [selectedMmsData, setSelectedMmsData] = useState<any>(null);
  const [selectedDispatchData, setSelectedDispatchData] = useState<any>(null);

  // MMS change handler - update local state and call parent callback
  const handleMmsChange = (value: string) => {
    if (mmsData && mmsData.length > 0) {
      const selectedMms = mmsData.find(mms => mms.mmsNumber === value);
      if (selectedMms) {
        setSelectedMmsData(selectedMms);
        if (onMmsChange) {
          onMmsChange(value);
        }
      }
    }
  };

  // Dispatch change handler - update local state and call parent callback
  const handleDispatchChange = (value: string) => {
    if (dispatchData && dispatchData.length > 0) {
      const selectedDispatch = dispatchData.find(dispatch => dispatch.dispatchNumber === value);
      if (selectedDispatch) {
        setSelectedDispatchData(selectedDispatch);
        if (onDispatchChange) {
          onDispatchChange(value);
        }
      }
    }
  };

  // Initialize selected data on component mount
  useEffect(() => {
    if (mmsData && mmsData.length > 0 && selectedMmsId) {
      const initialMms = mmsData.find(mms => mms.mmsNumber === selectedMmsId);
      if (initialMms) {
        setSelectedMmsData(initialMms);
      }
    }
  }, [mmsData, selectedMmsId]);

  useEffect(() => {
    if (dispatchData && dispatchData.length > 0 && selectedDispatchId) {
      const initialDispatch = dispatchData.find(dispatch => dispatch.dispatchNumber === selectedDispatchId);
      if (initialDispatch) {
        setSelectedDispatchData(initialDispatch);
      }
    }
  }, [dispatchData, selectedDispatchId]);

  // Document handling functions
  const handleViewDocument = (documentUrl: string) => {
    if (!documentUrl) {
      console.log("No document URL provided");
      return;
    }
    
    try {
      // Check if URL is valid
      const url = new URL(documentUrl);
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }
      
      // Open document in new tab
      const newWindow = window.open(documentUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        // If popup was blocked, show alert
        alert('Popup blocked! Please allow popups for this site to view documents.');
      }
    } catch (error) {
      console.error("Error opening document:", error);
      alert('Unable to open document. Please check the URL.');
    }
  };

  const handleDownloadDocument = async (documentUrl: string) => {
    if (!documentUrl) {
      console.log("No document URL provided");
      return;
    }

    try {
      // Validate URL
      const url = new URL(documentUrl);
      if (!url.protocol.startsWith("http")) {
        throw new Error("Invalid URL protocol");
      }

      // Fetch file as blob (more reliable for cross-origin/S3)
      const response = await fetch(documentUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`);
      }
      const blob = await response.blob();

      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = documentUrl.split("/").pop() || "document";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      console.log(`Downloading: ${fileName}`);
    } catch (error) {
      console.error("Error downloading document:", error);
      // Fallback: try direct navigation to URL to let browser handle download/view
      try {
        const a = document.createElement("a");
        a.href = documentUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (_) {}
      alert("Unable to download document. Please check the URL or try again.");
    }
  };
  // Create a field visibility map based on boolean props
  const fieldVisibility = {
    mmsNumber: showMMSNumber,
    date: showDate,
    document: showDocument,
    startTime: showStartTime,
    endTime: showEndTime,
    preQualityReport: showPreQualityReport,
    dispatchNumber: showDispatchNumber,
    billNumber: showBillNumber,
    dispatchFile: showDispatchFile,
    nameOfInstaller: showNameOfInstaller,
    fixingStartDate: showFixingStartDate,
    targetDate: showTargetDate,
    completionDate: showCompletionDate,
    manpowerUsed: showManpowerUsed,
    phrFile: showPhrFile,
    chrFile: showChrFile,
  };

  // Filter fields based on visibility and data availability
  const visibleFields = fields.filter(field => {
    const isVisible = fieldVisibility[field.key as keyof typeof fieldVisibility];
    
    // For MMS number fields, always show them if they have MMS data available
    if (field.key === 'mmsNumber' && mmsData && mmsData.length > 0) {
      return isVisible;
    }
    
    // For dispatch number fields, always show them if they have dispatch data available
    if (field.key === 'dispatchNumber' && dispatchData && dispatchData.length > 0) {
      return isVisible;
    }
    
    // For other fields, check if they have data
    return isVisible && currentDetails?.[field.key];
  });

  // Render field value based on type
  const renderFieldValue = (field: MMSField, value: any) => {
    switch (field.type) {
      case "date":
        // Format date using moment.js
        if (value) {
          const formattedDate = moment(value).format('DD/MM/YYYY');
          return <span className="font-semibold text-gray-800 text-center sm:text-left block">{formattedDate}</span>;
        }
        return <span className="font-semibold text-gray-400 text-center sm:text-left block">No date</span>;
      case "dropdown":
        // Check if this is an MMS number field and we have MMS data for dropdown
        if (field.key === 'mmsNumber' && mmsData && mmsData.length > 0) {
          // Filter out MMS records that don't have a mmsNumber
          const validMmsData = mmsData.filter(mms => mms.mmsNumber);
          
          if (validMmsData.length === 0) {
            return <span className="font-semibold text-gray-400">No MMS numbers available</span>;
          }
          
          // Use selected MMS data if available, otherwise use the first available MMS
          const currentMmsRecord = selectedMmsData || validMmsData[0];
          
          // Ensure we always have a valid MMS number for the dropdown value
          const dropdownValue = currentMmsRecord?.mmsNumber;
          
          return (
            <Select
              value={dropdownValue}
              onChange={handleMmsChange}
              placeholder="Select MMS Number"
              className="w-1/2"
              size="middle"
            >
              {validMmsData.map((mms) => (
                <Select.Option key={mms._id} value={mms.mmsNumber}>
                  {mms.mmsNumber}
                </Select.Option>
              ))}
            </Select>
          );
        }
        
        // Check if this is a dispatch number field and we have dispatch data for dropdown
        if (field.key === 'dispatchNumber' && dispatchData && dispatchData.length > 0) {
          // Use selected dispatch data if available, otherwise use the first available dispatch
          const currentDispatchRecord = selectedDispatchData || dispatchData[0];
          
          // Ensure we always have a valid dispatch number for the dropdown value
          const dropdownValue = currentDispatchRecord?.dispatchNumber;
          
          return (
            <Select
              value={dropdownValue}
              onChange={handleDispatchChange}
              placeholder="Select Dispatch Number"
              className="w-1/2"
              size="middle"
            >
              {dispatchData.map((dispatch) => (
                <Select.Option key={dispatch._id} value={dispatch.dispatchNumber}>
                  {dispatch.dispatchNumber}
                </Select.Option>
              ))}
            </Select>
          );
        }
        
        // Default dropdown display for other fields
        return (
          <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 sm:px-4 py-2 bg-white hover:border-gray-400 transition-colors duration-200 w-full sm:min-w-[200px] sm:w-auto">
            <span className="text-gray-800 font-semibold text-sm sm:text-base text-center sm:text-left">{value}</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        );
      case "document":
        return (
          <div className="flex flex-col items-center sm:items-start space-y-3">
            {/* Icons row */}
            <div className="flex items-center space-x-2 justify-center sm:justify-start">
              <button
                onClick={() => handleViewDocument(value)}
                disabled={!value}
                className={`p-2 rounded-md transition-colors duration-200 shadow-sm ${
                  value 
                    ? 'text-[var(--brand-primary)] bg-[var(--brand-surface)] hover:bg-[var(--brand-secondary)] hover:text-white cursor-pointer' 
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                title={value ? "View Document" : "No document available"}
              >
                <EyeOutlined className="text-base sm:text-lg" />
              </button>
              <button
                onClick={() => handleDownloadDocument(value)}
                disabled={!value}
                className={`p-2 rounded-md transition-colors duration-200 shadow-sm ${
                  value 
                    ? 'text-[#E37343] bg-[#FFE6DC] hover:bg-green-600 hover:text-white cursor-pointer' 
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                title={value ? "Download Document" : "No document available"}
              >
                <DownloadOutlined className="text-base sm:text-lg" />
              </button>
            </div>
            {/* Document name below icons */}
            {value && (
              <div className="w-full text-center sm:text-left">
                <span className="text-gray-800 font-semibold text-xs sm:text-sm break-words block">
                  {value.split('/').pop() || 'Document'}
                </span>
              </div>
            )}
          </div>
        );
      case "time":
        return <span className="font-semibold text-[var(--brand-primary)] text-center sm:text-left block">{value}</span>;
      default:
        return <span className="font-semibold text-gray-800 text-center sm:text-left block">{value}</span>;
    }
  };

  // Get label color based on field type
  const getLabelColor = (field: MMSField) => {
    if (field.type === "time") {
      return "text-[var(--brand-primary)]"; // Brand primary for Start Time and End Time
    }
    return "text-gray-600"; // Default gray for other fields
  };

  return (
    <div className="w-full mx-auto my-4 font-sans">
      {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">{customTitle || title}</h2> */}

      <div className={`border ${customBorderColor} rounded-lg shadow-md bg-white`}>
        <div className={`bg-[#274699] rounded-t-lg text-white font-semibold px-4 sm:px-6 lg:px-8 py-2 text-center text-base sm:text-lg`}>
          {customTitle || title}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-3 sm:space-y-4 w-full">
          {visibleFields.map((field) => (
            <div
              key={field.key}
              className="flex sm:flex-row sm:items-center"
            >
              <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">
                {field.label}
              </div>
              <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base text-center sm:text-left">
                {(() => {
                  // Use selected data if available, otherwise fall back to currentDetails
                  let fieldValue;
                  if (selectedMmsData && selectedMmsData[field.key] !== undefined) {
                    fieldValue = selectedMmsData[field.key];
                  } else if (selectedDispatchData && selectedDispatchData[field.key] !== undefined) {
                    fieldValue = selectedDispatchData[field.key];
                  } else {
                    fieldValue = currentDetails?.[field.key];
                  }
                  
                  // Special handling for document field - check for various document field names in selectedMmsData
                  if (field.key === 'document' && selectedMmsData) {
                    // Check for different document field names based on card type
                    if (selectedMmsData.mmsDocument !== undefined) {
                      fieldValue = selectedMmsData.mmsDocument;
                    } else if (selectedMmsData.bomDocument !== undefined) {
                      fieldValue = selectedMmsData.bomDocument;
                    } else if (selectedMmsData.productionDocument !== undefined) {
                      fieldValue = selectedMmsData.productionDocument;
                    } else if (selectedMmsData.dispatchDocument !== undefined) {
                      fieldValue = selectedMmsData.dispatchDocument;
                    } else if (selectedMmsData.installationDocument !== undefined) {
                      fieldValue = selectedMmsData.installationDocument;
                    }
                  }
                  
                  return renderFieldValue(field, fieldValue);
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
