"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Breadcrumbs from "./components/Breadcrumbs";
import React, { useState, useEffect } from "react";
import {
  isAuthRoute,
  isAuthenticated,
  scheduleAutoLogout,
} from "./utils/CheckLoggedin";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Schedule auto-logout when token hits expiry
  useEffect(() => {
    const timeoutId = scheduleAutoLogout();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  if (!isClient) {
    return null;
  }

  if (isAuthRoute(pathname) || !isAuthenticated()) {
    return (
      <div className="bg-[#E2F2C3] h-screen overflow-hidden">{children}</div>
    );
  }

  return (
    <div className="flex h-screen font-sans relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setPageTitle={setPageTitle}
      />

      <div
        className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <Header
          toggleSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />
        <main
          className={`
          flex-1 p-2 sm:p-4 
          overflow-y-auto                  
          overflow-x-auto
          relative
        `}
          style={{ zIndex: 1 }}
        >
          {pathname !== "/dashboard" && (
            <Breadcrumbs
              basePath="/dashboard"
              labelMap={{
                dashboard: "Home",
                usermanagement: "Admin Management",
                addnewuser: "Add New Admin",
                rolemanagement: "Role Management",
                clientmanagement: "AdvisorManagement",
                vendormanagement: "Vendor Management",
                edit: "Edit",
                addproject: "Add Project",
                installers: "Installers",
                viewinstaller: "View Installer",
                manageinstaller: "Manage Installer",
                viewclient: "View Advisor",
              }}
              skippedSegments={[
                "id",
                "complaintId",
                "userId",
                "clientId",
                "roleId",
                "installerId",
                "projectId",
              ]}
            />
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
