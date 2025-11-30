"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";

interface Remark {
  _id: string;
  remarkDate: string;
  remarkTime: string;
  remarkDescription: string;
}

interface ProjectData {
  _id: string;
  projectCode: string;
  category: string;
  title: string;
  description: string;
  billingAddress: string;
  shippingAddress: string;
  phoneNumber: string;
  projectStartingDate: string;
  projectCurrentStage: string;
  productType: string;
  warrantyPeriod: string;
  remark: Remark[];
  site: any[];
  mms: any[];
  dispatch: any[];
  installationComplete: any[];
  testimonial: any[];
  bom: any[];
  production: any[];
  readyToDispatch: any[];
  teamInfo: any[];
  softDataDocument: string;
}

interface ProjectDetailsCardProps {
  data: ProjectData;
}

export default function ProjectDetailsCard({ data }: ProjectDetailsCardProps) {
  const router = useRouter();

  // Add a check for missing data to prevent errors
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-10 text-center border rounded-lg shadow-md bg-white">
        No project data provided.
      </div>
    );
  }



  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden">

      {/* Header Section */}
      <div className="bg-[#274699] text-white px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex sm:flex-row sm:items-center">
          <div className="w-full sm:w-1/3 font-medium text-white text-sm sm:text-base mb-1 sm:mb-0">Project Code</div>
          <div className="w-full sm:w-2/3 text-white text-sm sm:text-base font-semibold text-center sm:text-left">{data.projectCode}</div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white">
        {/* Project Details Section */}
        <div className="space-y-3 sm:space-y-4">
          {/* Project Code */}
          {/* <div className="flex flex-col sm:flex-row sm:items-start">
             <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Project Code</div>
           </div> */}

          {/* Category */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Category</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.category}</div>
          </div>

          {/* Title */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Title</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.title}</div>
          </div>

          {/* Description */}
          <div className="flex  sm:flex-row sm:items-start">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-[#274699] text-sm sm:text-base mb-1 sm:mb-0">Description</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.description}</div>
          </div>

          {/* Billing Address */}
          <div className="flex  sm:flex-row sm:items-start">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Billing Address</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.billingAddress}</div>
          </div>

          {/* Shipping Address */}
          <div className="flex  sm:flex-row sm:items-start">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Shipping Address</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.shippingAddress}</div>
          </div>

          {/* Mobile Number */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Mobile Number</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.phoneNumber || 'N/A'}</div>
          </div>

          {/* Project Starting Date */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Project Starting Date</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">
              {data.projectStartingDate ? new Date(data.projectStartingDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Product Type */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Product Type</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.productType}</div>
          </div>

          {/* Warranty Period */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Warranty Period</div>
            <div className="w-full sm:w-2/3 text-gray-800 text-sm sm:text-base font-semibold text-center sm:text-left">{data.warrantyPeriod}</div>
          </div>

          {/* Current Status */}
          <div className="flex  sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 font-medium text-gray-500 text-sm sm:text-base mb-1 sm:mb-0">Current Status</div>
            <div className="w-full sm:w-2/3">
              <span className="bg-orange-100 text-orange-600 px-3 py-1 text-xs sm:text-sm rounded-md font-medium">
                {data.projectCurrentStage}
              </span>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        {data.remark && data.remark.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-4">Remarks</h3>
            <div className="space-y-4">
              {data.remark.map((remark, index) => (
                <div key={remark._id || index} className="relative">
                  {/* Remark Text */}
                  <div className="text-gray-800 mb-2 leading-relaxed text-sm sm:text-base font-semibold">
                    {remark.remarkDescription}
                  </div>

                  {/* Date and Time */}
                  <div className="text-[#274699] text-xs sm:text-sm font-semibold">
                    {new Date(remark.remarkDate).toLocaleDateString()} | {new Date(remark.remarkTime).toLocaleTimeString()}
                  </div>

                  {/* Separator line (except for last item) */}
                  {index < data.remark.length - 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}