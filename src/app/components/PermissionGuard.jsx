"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "../hooks/usePermissions";
import { MODULES } from "../utils/permissions";

// Beautiful Access Denied Component
const AccessDeniedPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Alternative Action */}
        <div className="mt-4 text-center">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-4 left-4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Error Code:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">403</span>
        </p>
      </div>
    </div>
  </div>
);

const PermissionGuard = ({
  children,
  module,
  permissionLevel = "read",
  action,
  fallback = null,
  showLoader = true,
  requireAll = false,
  permissions = [],
  redirectTo = "/dashboard",
  showAccessDenied = true,
}) => {
  const { checkPermission, checkActionPermission, isLoading } =
    usePermissions();
  const router = useRouter();

  // No loader shown while permissions are loading
  if (isLoading && showLoader) {
    return null; // Return null instead of showing loader
  }

  // Beautiful Access Denied Component
  const AccessDeniedPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Main Content Card */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            {/* Animated Ring */}
            <div className="absolute inset-0 w-20 h-20 border-2 border-red-300 rounded-full animate-ping opacity-75"></div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sorry, you don't have the required permissions to access this page.
            Please contact your administrator if you believe this is an error.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full cursor-pointer bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </span>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-4 left-4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Error Code:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">403</span>
          </p>
        </div>
      </div>
    </div>
  );

  // Check single permission (if module and permissionLevel are provided)
  if (module && permissionLevel && !action) {
    const hasAccess = checkPermission(module, permissionLevel);
    if (!hasAccess) {
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return fallback;
    }
  }

  // Check specific action (if action is provided)
  if (action) {
    const hasAccess = checkActionPermission(action);
    if (!hasAccess) {
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return fallback;
    }
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const permissionChecks = permissions.map(
      ({ module: mod, permissionLevel: level, action: act }) => {
        if (act) {
          return checkActionPermission(act);
        }
        if (mod && level) {
          return checkPermission(mod, level);
        }
        return false;
      }
    );

    const hasAccess = requireAll
      ? permissionChecks.every((check) => check === true)
      : permissionChecks.some((check) => check === true);

    if (!hasAccess) {
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return fallback;
    }
  }

  // If no permission checks are specified, allow access
  if (!module && !action && permissions.length === 0) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withPermission = (WrappedComponent, permissionConfig) => {
  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGuard {...permissionConfig}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

// Route protection components for specific modules
export const UserManagementRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.ADMIN_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

export const RoleManagementRouteGuard = ({ children }) => {
  const { isSuperAdmin, canManageRoles, isLoading } = usePermissions();

  // Show nothing while permissions are loading (skeleton loader will handle the visual feedback)
  if (isLoading) {
    return children;
  }

  // Check if user is super admin OR has role management permissions
  const hasAccess = isSuperAdmin() || canManageRoles();

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              You don't have permission to access this page. Only Super Admin
              users can access Role Management.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const ClientManagementRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.AGENT_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

export const InstallersRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.INSTALLER_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

export const VendorManagementRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.VENDOR_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

export const CategoryManagementRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.CATEGORY_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

export const CustomerManagementRouteGuard = ({ children }) => (
  <PermissionGuard
    module={MODULES.CUSTOMER_MANAGEMENT}
    permissionLevel="read"
    redirectTo="/dashboard"
  >
    {children}
  </PermissionGuard>
);

// Specific permission guards for common use cases
export const ReadPermissionGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard module={module} permissionLevel="read" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const WritePermissionGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard module={module} permissionLevel="write" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const DeletePermissionGuard = ({
  children,
  module,
  fallback = null,
}) => (
  <PermissionGuard module={module} permissionLevel="delete" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ActionPermissionGuard = ({
  children,
  action,
  fallback = null,
}) => (
  <PermissionGuard action={action} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Simple permission-aware button wrapper
export const PermissionButton = ({
  module,
  permissionLevel = "write",
  action,
  children,
  disabled = false,
  fallback = null,
  showDisabled = true,
  ...buttonProps
}) => {
  const { checkPermission, checkActionPermission } = usePermissions();

  let hasPermission = false;
  let isDisabled = disabled;

  if (action) {
    hasPermission = checkActionPermission(action);
  } else if (module) {
    hasPermission = checkPermission(module, permissionLevel);
  }

  // If user doesn't have permission and we should show disabled button
  if (!hasPermission && showDisabled) {
    isDisabled = true;
  }

  // If user doesn't have permission and we shouldn't show disabled button
  if (!hasPermission && !showDisabled) {
    return fallback;
  }

  // Clone the child element and add disabled prop
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...buttonProps,
    disabled: isDisabled,
    title: isDisabled
      ? "You don't have permission for this action"
      : buttonProps.title,
  });
};

export default PermissionGuard;
