"use client";

import React, { useState } from "react";
import { Card, Select, Typography, Space, Row, Col } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

interface Site {
  _id: string;
  siteName?: string;
  siteLocation?: string;
  siteFloor?: string;
  siteSillLevel?: string;
  siteType?: string;
  siteWidth?: string;
  siteHeight?: string;
  siteStatus?: string;
}

interface SiteSurveyCardProps {
  sites?: Site[];
}

export default function SiteSurveyCard({ sites = [] }: SiteSurveyCardProps) {
  // State to keep track of the selected site. It defaults to the first site.
  const [selectedSite, setSelectedSite] = useState<string>(
    sites.length > 0 ? sites[0]._id : ""
  );

  // Get the details for the currently selected site
  const currentSite = sites.find((site) => site._id === selectedSite);

  // If no sites are provided, show a message
  if (sites.length === 0) {
    return (
      <div className="max-full mx-auto my-4 sm:my-8 font-sans px-4 sm:px-0">
        <Title level={3} className="mb-3 sm:mb-4">
          Project Stages
        </Title>
        <Card
          title="Site Survey"
          headStyle={{
            backgroundColor: "#274699",
            color: "white",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600",
          }}
          className="shadow-md"
        >
          <div className="text-center text-gray-500 text-sm sm:text-base">
            No site survey data available for this project.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="">
      <Title level={3} className="mb-3 sm:mb-4">
        Project Stages
      </Title>
      <div className="border border-gray-200 rounded-lg shadow-md bg-white">
        {/* Header */}
        <div className="bg-[#274699] rounded-t-lg text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 text-center text-sm md:text-base">
          Site Survey
        </div>

        {/* Body */}
        <div className="px-4 sm:px-8 lg:px-20 py-4 sm:py-6 space-y-3 sm:space-y-4 w-full">
          {/* Dropdown */}
          <label
            htmlFor="site-select"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Select Site to See the Details
          </label>
          <select
            id="site-select"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full border h-[35px] border-gray-300 rounded-md px-3 mb-4 sm:mb-6 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#274699] bg-white text-sm sm:text-base leading-[35px]"
          >
            {sites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.siteName || `Site ${site._id}`}
              </option>
            ))}
          </select>

          {/* Details List */}
          {currentSite && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Name
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteName || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Location
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteLocation || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Floor
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteFloor || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Sill Level
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteSillLevel || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Type
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteType || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Size
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteWidth && currentSite.siteHeight
                      ? `${currentSite.siteWidth} × ${currentSite.siteHeight}`
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-start gap-2 sm:gap-4 text-sm sm:text-base">
                <div className="w-[50%] flex justify-start">
                  <span className="font-medium text-gray-600 mb-1 sm:mb-0 text-left">
                    Status
                  </span>
                </div>
                <div className="w-[50%] flex justify-start">
                  <span className="font-semibold text-gray-900 break-words">
                    {currentSite.siteStatus || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
