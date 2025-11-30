"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Key,
  X,
  AlertTriangle,
  Wrench,
  Package,
  ChartBarStacked,
  Briefcase,
  UserCheck,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { clearUserData } from "../utils/CheckLoggedin";
import { useRouter } from "next/navigation";
import { MdOutlineDashboardCustomize } from "react-icons/md";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  setPageTitle: (title: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  setPageTitle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    canAccessDashboard,
    canManageRoles,
    canManageUsers,
    canManageClients,
    canManageProjects,
    canManageComplaints,
    canManageInstallers,
    canManageParts,
    canManageCategories,
    isLoading,
    currentUser,
  } = usePermissions();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    clearUserData();
    router.push("/login");
  };

  const handleClick = (title: string) => {
    setPageTitle(title);
    if (window.innerWidth < 768) closeSidebar();
  };

  // Function to check if a route is active
  const isActiveRoute = (route: string) => {
    if (route === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(route);
  };

  // Function to get link classes with active state
  const getLinkClasses = (route: string, index: number = 0) => {
    const baseClasses =
      "flex items-center gap-3 font-medium cursor-pointer text-[14px] rounded-xl w-full py-3 px-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group";
    const activeClasses =
      "text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-xl scale-[1.02] -translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300";
    const hoverClasses =
      "text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[var(--brand-primary)] hover:to-[var(--brand-secondary)] group hover:shadow-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20";

    // Add staggered delay for opening animation
    const delayClass = sidebarOpen ? `delay-[${index * 100}ms]` : "delay-0";

    return isActiveRoute(route)
      ? `${baseClasses} ${activeClasses} ${delayClass}`
      : `${baseClasses} ${hoverClasses} ${delayClass}`;
  };

  // Function to get dashboard title based on user role
  const getDashboardTitle = () => {
    // Don't show admin title until currentUser is properly loaded
    if (!currentUser || isLoading) {
      return "Dashboard";
    }

    // Check if user is admin (adjust the property path as needed)
    const isAdmin =
      (currentUser as any)?.assignedRole?.roleName?.toLowerCase() === "admin" ||
      (currentUser as any)?.assignedRole?.name?.toLowerCase() === "admin";

    if (isAdmin) {
      return "Hello Admin! You're Logged in as : Super Admin";
    }
    return "Dashboard";
  };

  const [installerDropdownOpen, setInstallerDropdownOpen] =
    React.useState(false);

  if (isLoading) {
    return (
      <aside className="w-[250px] md:w-[160px] lg:w-[250px] h-full bg-[#E2F2C3] p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </aside>
    );
  }

  return (
    <div className="sidebar-container">
      {/* Backdrop with delayed fade effect */}
      <div
        className={`
          fixed inset-0 backdrop-blur-sm bg-black/20 md:hidden
          transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
            sidebarOpen
              ? "opacity-100 visible delay-100"
              : "opacity-0 invisible delay-0"
          }
        `}
        style={{ zIndex: 2147483646 }}
        onClick={closeSidebar}
      ></div>

      <aside
        className={`
          overflow-y-auto 
          fixed md:relative
          w-[280px] md:w-[280px] lg:w-[280px] 
          h-full bg-gradient-to-br from-[var(--brand-surface)] via-[#F0F8E3] to-[var(--brand-surface)]
          backdrop-blur-sm
          flex flex-col p-4
          transform transition-all duration-800 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          shadow-2xl shadow-[rgba(203,59,17,0.12)]
          border-r border-[rgba(203,59,17,0.15)]
          ${
            sidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[300px] opacity-0 md:translate-x-0 md:opacity-100"
          }
        `}
        style={{ zIndex: 2147483647 }}
      >
        {/* Close Button (mobile) */}
        <button
          type="button"
          title="Close sidebar"
          onClick={closeSidebar}
          className="md:hidden absolute top-4 right-4 p-2.5 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:rotate-90 cursor-pointer backdrop-blur-sm border border-white/20"
        >
          <X
            size={18}
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
          />
        </button>

        {/* Logo section */}
        <div className="mb-6 flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group">
          <div className="h-24 w-[100px] md:w-[100px] lg:w-[130px] rounded-xl flex items-center justify-center ">
            <img
              src="/images/logo.png"
              alt="Logo green building solutions"
              className="transition-all duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
          {/* <span className="text-[7px] text-[#4A4A4A] font-normal tracking-tight leading-none ml-[35px] mt-[-10px] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[var(--brand-primary)]">
            Green Building Solutions
          </span> */}
          <hr className="border-t border-gradient-to-r from-transparent via-[#D0D0D0] to-transparent w-full mt-4 mb-2 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:border-[var(--brand-primary)] group-hover:shadow-sm" />
        </div>

        {/* Navigation links */}
        <ul className="space-y-2 flex-1">
          {/* Dashboard */}
          {canAccessDashboard() && (
            <li className="transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-200">
              <Link
                href="/dashboard"
                className={getLinkClasses("/dashboard", 0)}
                onClick={() => handleClick(getDashboardTitle())}
              >
                <MdOutlineDashboardCustomize
                  size={20}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard")
                      ? "text-white"
                      : "text-[#232323] text-[14px] group-hover:text-white"
                  }
                >
                  Dashboard
                </span>
              </Link>
            </li>
          )}

          {/* Role Management */}
          {canManageRoles() && (
            <li className="transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-300">
              <Link
                href="/dashboard/rolemanagement"
                className={getLinkClasses("/dashboard/rolemanagement", 1)}
                onClick={() => handleClick("Role Management")}
              >
                <Key
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/rolemanagement")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/rolemanagement")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  Role Management
                </span>
              </Link>
            </li>
          )}

          {/* Admin Management */}
          {canManageUsers() && (
            <li className="transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-400">
              <Link
                href="/dashboard/usermanagement"
                className={getLinkClasses("/dashboard/usermanagement", 2)}
                onClick={() => handleClick("Bandhan Guru Team")}
              >
                <Users
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/usermanagement")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/usermanagement")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  BandhanGuru Team
                </span>
              </Link>
            </li>
          )}

          {/* Agent Management */}
          {canManageClients() && (
            <li>
              <Link
                href="/dashboard/clientmanagement"
                className={getLinkClasses("/dashboard/clientmanagement")}
                onClick={() => handleClick("Advisor Management")}
              >
                <Briefcase
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/clientmanagement")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/clientmanagement")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  Advisor Management
                </span>
              </Link>
            </li>
          )}

          {canManageParts() && (
            <li>
              <Link
                href="/dashboard/vendormanagement"
                className={getLinkClasses("/dashboard/vendormanagement")}
                onClick={() => handleClick("Vendor Management")}
              >
                <Package
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/vendormanagement")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/vendormanagement")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  Vendor Management
                </span>
              </Link>
            </li>
          )}

          {/* Subscribed Vendor */}
          {canManageParts() && (
            <li>
              <Link
                href="/dashboard/subscribedvendors"
                className={getLinkClasses("/dashboard/subscribedvendors")}
                onClick={() => handleClick("Approved Vendors")}
              >
                <CheckCircle
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/subscribedvendors")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/subscribedvendors")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  Approved Vendors
                </span>
              </Link>
            </li>
          )}

          {canManageCategories() && (
            <li>
              <Link
                href="/dashboard/categorymanagement"
                className={getLinkClasses("/dashboard/categorymanagement")}
                onClick={() => handleClick("Category Management")}
              >
                <ChartBarStacked
                  size={18}
                  className={`transition-all duration-300 ${
                    isActiveRoute("/dashboard/categorymanagement")
                      ? "text-white drop-shadow-sm"
                      : "text-black group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span
                  className={
                    isActiveRoute("/dashboard/categorymanagement")
                      ? "text-white"
                      : "text-[#232323] group-hover:text-white"
                  }
                >
                  Category Management
                </span>
              </Link>
            </li>
          )}

          {/* Temporarily show Customer Management for testing - remove permission check */}
          <li>
            <Link
              href="/dashboard/customermanagement"
              className={getLinkClasses("/dashboard/customermanagement")}
              onClick={() => handleClick("Customer Management")}
            >
              <UserCheck
                size={18}
                className={`transition-all duration-300 ${
                  isActiveRoute("/dashboard/customermanagement")
                    ? "text-white drop-shadow-sm"
                    : "text-black group-hover:text-white group-hover:scale-110"
                }`}
              />
              <span
                className={
                  isActiveRoute("/dashboard/customermanagement")
                    ? "text-white"
                    : "text-[#232323] group-hover:text-white"
                }
              >
                Customer Management
              </span>
            </Link>
          </li>

          {/* Advisor Application */}
          <li>
            <Link
              href="/dashboard/advisorApplication"
              className={getLinkClasses("/dashboard/advisorApplication")}
              onClick={() => handleClick("Advisor Application")}
            >
              <ClipboardList
                size={18}
                className={`transition-all duration-300 ${
                  isActiveRoute("/dashboard/advisorApplication")
                    ? "text-white drop-shadow-sm"
                    : "text-black group-hover:text-white group-hover:scale-110"
                }`}
              />
              <span
                className={
                  isActiveRoute("/dashboard/advisorApplication")
                    ? "text-white"
                    : "text-[#232323] group-hover:text-white"
                }
              >
                Advisor Application
              </span>
            </Link>
          </li>
          <li className="mt-20 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[400ms]">
            <div
              className="flex items-center gap-3 font-medium cursor-pointer text-[14px] rounded-xl w-full py-3 px-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group bg-gradient-to-r from-red-50 to-red-100 hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white shadow-sm hover:shadow-red-200 border border-red-200 hover:border-red-300"
              onClick={handleLogout}
            >
              <span className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                🚪
              </span>
              <span className="font-medium transition-all duration-300">
                Logout
              </span>
            </div>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
