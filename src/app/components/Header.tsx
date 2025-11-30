"use client";
import React, { useState, useRef } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermissions } from "../hooks/usePermissions";
import { clearUserData } from "../utils/CheckLoggedin";
import Link from "next/link";

type HeaderProps = {
  toggleSidebar: () => void;
  pageTitle: string;
};

interface User {
  id: string;
  userName?: string;
  emailId?: string;
  assignedRole?: {
    roleName?: string;
    permissions?: any;
  };
}

const Header = ({ toggleSidebar, pageTitle }: HeaderProps) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { currentUser } = usePermissions();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false);
    }, 300);
  };

  // Get user display name
  const getUserDisplayName = () => {
    const user = currentUser as User | null;
    if (user?.userName) {
      return user.userName;
    }
    if (user?.emailId) {
      return user.emailId.split("@")[0];
    }
    return "User";
  };

  // Get user role
  const getUserRole = () => {
    const user = currentUser as User | null;
    return user?.assignedRole?.roleName || "User";
  };

  return (
    <div className="w-full bg-gradient-to-r from-[var(--brand-surface)] via-[#F0F8E3] to-[var(--brand-surface)] h-16 flex items-center px-1 md:px-6 justify-between shadow-lg shadow-[rgba(203,59,17,0.15)] border-b border-[rgba(203,59,17,0.15)] backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2.5 rounded-xl focus:outline-none cursor-pointer bg-white/30 hover:bg-white/50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:shadow-lg backdrop-blur-sm border border-white/20"
          aria-label="Toggle Sidebar"
        >
          <Menu
            size={20}
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
          />
        </button>
        <div className="flex flex-col">
          <p className="text-gray-800 font-bold text-xl max-[350px]:text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {pageTitle}
          </p>
          <div className="h-0.5 w-12 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full mt-1"></div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative justify-center">
        <div className="hidden sm:flex items-center justify-center h-8 w-[1px]">
          <div className="w-1 h-6 bg-gradient-to-b from-transparent via-[var(--brand-secondary)]/40 to-transparent"></div>
        </div>

        {/* Profile section with hover dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center cursor-pointer p-2.5 rounded-xl bg-white/30">
            <div className="hidden sm:block text-right mr-3">
              <p className="text-gray-800 font-medium text-sm group-hover:text-gray-900 transition-colors duration-200">
                {getUserDisplayName()}
              </p>
              <p className="text-gray-600 text-xs group-hover:text-gray-700 transition-colors duration-200">
                {getUserRole()}
              </p>
            </div>
            <span className="cursor-pointer flex items-center justify-center">
              <img
                className="w-8 h-8 rounded-full transition-all duration-300 group-hover:scale-110 "
                src="/images/profileicon.png"
                alt="User"
              />
            </span>
          </div>

          {/* Dropdown menu on hover */}
          {/* <div
            className={`fixed z-[9999] right-4 top-20 w-56 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-[rgba(200,128,40,0.25)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isDropdownVisible
                ? "opacity-100 visible translate-y-0 scale-100"
                : "opacity-0 invisible -translate-y-2 scale-95"
            }`}
          >
            <div className="px-5 py-4 border-b border-gray-100/50 bg-gradient-to-r from-[var(--brand-surface)]/60 to-white/60">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                {(currentUser as User | null)?.emailId}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-xs text-gray-400 font-medium">
                  {getUserRole()}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
