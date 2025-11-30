"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserPermissions,
  getCurrentUser,
  hasPermission,
  canRead,
  canWrite,
  canDelete,
  canCreate,
  canEdit,
  canView,
  canPerformAction,
  hasAnyPermission,
  getAccessibleModules,
  getPermissionLevel,
  getUIPermissions,
  MODULES,
  PERMISSION_LEVELS,
  PERMISSION_ACTIONS,
} from "../utils/permissions";

export const usePermissions = () => {
  const [userPermissions, setUserPermissions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [accessibleModules, setAccessibleModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePermissions = () => {
      try {
        const permissions = getUserPermissions();
        const user = getCurrentUser();
        const modules = getAccessibleModules(permissions);

        setUserPermissions(permissions);
        setCurrentUser(user);
        setAccessibleModules(modules);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing permissions:", error);
        setIsLoading(false);
      }
    };

    initializePermissions();

    const handleStorageChange = (e) => {
      if (e.key === "userData" || e.key === null) {
        initializePermissions();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // General permission checkers
  const checkPermission = useCallback(
    (module, level) => hasPermission(userPermissions, module, level),
    [userPermissions]
  );
  const checkReadPermission = useCallback(
    (module) => canRead(userPermissions, module),
    [userPermissions]
  );
  const checkWritePermission = useCallback(
    (module) => canWrite(userPermissions, module),
    [userPermissions]
  );
  const checkDeletePermission = useCallback(
    (module) => canDelete(userPermissions, module),
    [userPermissions]
  );
  const checkCreatePermission = useCallback(
    (module) => canCreate(userPermissions, module),
    [userPermissions]
  );
  const checkEditPermission = useCallback(
    (module) => canEdit(userPermissions, module),
    [userPermissions]
  );
  const checkViewPermission = useCallback(
    (module) => canView(userPermissions, module),
    [userPermissions]
  );
  const checkActionPermission = useCallback(
    (action) => canPerformAction(userPermissions, action),
    [userPermissions]
  );
  const checkAnyPermission = useCallback(
    (module) => {
      const result = hasAnyPermission(userPermissions, module);
      console.log("checkAnyPermission:", { module, result, userPermissions });
      return result;
    },
    [userPermissions]
  );

  // UI helpers
  const getPermissionLevelForModule = useCallback(
    (module) => getPermissionLevel(userPermissions, module),
    [userPermissions]
  );
  const getUIPermissionsForModule = useCallback(
    (module) => getUIPermissions(userPermissions, module),
    [userPermissions]
  );

  // Super Admin check - only users with "admin" or "super admin" role can access role management
  const isSuperAdmin = useCallback(() => {
    if (!currentUser || isLoading) {
      console.log("isSuperAdmin: No currentUser or still loading", {
        currentUser,
        isLoading,
      });
      return false;
    }

    // Check both the direct role field and assignedRole
    const directRole = currentUser?.role?.toLowerCase();
    const roleName = currentUser?.assignedRole?.roleName?.toLowerCase();
    const roleNameAlt = currentUser?.assignedRole?.name?.toLowerCase();

    console.log("isSuperAdmin: Current user data:", currentUser);
    console.log("isSuperAdmin: Role names:", {
      directRole,
      roleName,
      roleNameAlt,
    });

    // Check for various admin role variations
    const isAdmin =
      directRole === "admin" ||
      directRole === "super admin" ||
      directRole === "superadmin" ||
      roleName === "admin" ||
      roleName === "super admin" ||
      roleName === "superadmin" ||
      roleNameAlt === "admin" ||
      roleNameAlt === "super admin" ||
      roleNameAlt === "superadmin";

    console.log("isSuperAdmin: Is admin?", isAdmin);

    return isAdmin;
  }, [currentUser, isLoading]);

  // Module access checks
  const canAccessDashboard = useCallback(() => {
    // Allow all authenticated users to access dashboard
    return true;
  }, []);
  const canManageRoles = useCallback(() => {
    // Super admin users can always manage roles
    if (isSuperAdmin()) {
      console.log("canManageRoles: Super admin detected, allowing access");
      return true;
    }

    // For non-super admin users, check specific permissions
    const hasPermission = checkAnyPermission(MODULES.ROLE_MANAGEMENT);
    console.log("canManageRoles: Checking permissions for role management:", {
      hasPermission,
      userPermissions,
      module: MODULES.ROLE_MANAGEMENT,
    });
    return hasPermission;
  }, [isSuperAdmin, checkAnyPermission, userPermissions]);
  const canManageUsers = useCallback(
    () => checkAnyPermission(MODULES.ADMIN_MANAGEMENT),
    [checkAnyPermission]
  );
  const canManageClients = useCallback(
    () => checkAnyPermission(MODULES.AGENT_MANAGEMENT),
    [checkAnyPermission]
  );
  const canManageProjects = useCallback(
    () => checkAnyPermission(MODULES.PROJECT_MANAGEMENT),
    [checkAnyPermission]
  );
  const canManageComplaints = useCallback(
    () => checkAnyPermission(MODULES.VIEW_COMPLAINTS),
    [checkAnyPermission]
  );
  const canManageInstallers = useCallback(
    () => checkAnyPermission(MODULES.INSTALLER_MANAGEMENT),
    [checkAnyPermission]
  );
  const canManageParts = useCallback(
    () => checkAnyPermission(MODULES.VENDOR_MANAGEMENT),
    [checkAnyPermission]
  );
  const canManageCategories = useCallback(
    () => checkAnyPermission(MODULES.CATEGORY_MANAGEMENT),
    [checkAnyPermission]
  );
  // const canManageCustomers = useCallback(
  //   () => checkAnyPermission(MODULES.CUSTOMER_MANAGEMENT),
  //   [checkAnyPermission]
  // );

  // Action-level permission checkers
  const canCreateUser = useCallback(
    () => checkCreatePermission(MODULES.ADMIN_MANAGEMENT),
    [checkCreatePermission]
  );
  const canEditUser = useCallback(
    () => checkEditPermission(MODULES.ADMIN_MANAGEMENT),
    [checkEditPermission]
  );
  const canDeleteUser = useCallback(
    () => checkDeletePermission(MODULES.ADMIN_MANAGEMENT),
    [checkDeletePermission]
  );

  const canCreateRole = useCallback(
    () => checkCreatePermission(MODULES.ROLE_MANAGEMENT),
    [checkCreatePermission]
  );
  const canEditRole = useCallback(
    () => checkEditPermission(MODULES.ROLE_MANAGEMENT),
    [checkEditPermission]
  );
  const canDeleteRole = useCallback(
    () => checkDeletePermission(MODULES.ROLE_MANAGEMENT),
    [checkDeletePermission]
  );

  const canCreateClient = useCallback(
    () => checkCreatePermission(MODULES.AGENT_MANAGEMENT),
    [checkCreatePermission]
  );
  const canEditClient = useCallback(
    () => checkEditPermission(MODULES.AGENT_MANAGEMENT),
    [checkEditPermission]
  );
  const canDeleteClient = useCallback(
    () => checkDeletePermission(MODULES.AGENT_MANAGEMENT),
    [checkDeletePermission]
  );

  const canCreateProject = useCallback(
    () => checkCreatePermission(MODULES.PROJECT_MANAGEMENT),
    [checkCreatePermission]
  );
  const canEditProject = useCallback(
    () => checkEditPermission(MODULES.PROJECT_MANAGEMENT),
    [checkEditPermission]
  );
  const canDeleteProject = useCallback(
    () => checkDeletePermission(MODULES.PROJECT_MANAGEMENT),
    [checkDeletePermission]
  );

  const canCreateComplaint = useCallback(
    () => checkCreatePermission(MODULES.VIEW_COMPLAINTS),
    [checkCreatePermission]
  );
  const canEditComplaint = useCallback(
    () => checkEditPermission(MODULES.VIEW_COMPLAINTS),
    [checkEditPermission]
  );
  const canDeleteComplaint = useCallback(
    () => checkDeletePermission(MODULES.VIEW_COMPLAINTS),
    [checkDeletePermission]
  );

  const canCreateInstaller = useCallback(
    () => checkCreatePermission(MODULES.INSTALLER_MANAGEMENT),
    [checkCreatePermission]
  );
  const canEditInstaller = useCallback(
    () => checkEditPermission(MODULES.INSTALLER_MANAGEMENT),
    [checkEditPermission]
  );
  const canDeleteInstaller = useCallback(
    () => checkDeletePermission(MODULES.INSTALLER_MANAGEMENT),
    [checkDeletePermission]
  );

  const canCreateParts = useCallback(() => {
    return checkCreatePermission(MODULES.VENDOR_MANAGEMENT);
  }, [checkCreatePermission]);

  const canEditParts = useCallback(() => {
    return checkEditPermission(MODULES.VENDOR_MANAGEMENT);
  }, [checkEditPermission]);

  const canDeleteParts = useCallback(() => {
    return checkDeletePermission(MODULES.VENDOR_MANAGEMENT);
  }, [checkDeletePermission]);

  const canCreateCategory = useCallback(() => {
    return checkCreatePermission(MODULES.CATEGORY_MANAGEMENT);
  }, [checkCreatePermission]);

  const canEditCategory = useCallback(() => {
    return checkEditPermission(MODULES.CATEGORY_MANAGEMENT);
  }, [checkEditPermission]);

  const canDeleteCategory = useCallback(() => {
    return checkDeletePermission(MODULES.CATEGORY_MANAGEMENT);
  }, [checkDeletePermission]);

  return {
    // State
    userPermissions,
    currentUser,
    accessibleModules,
    isLoading,

    // Permission checkers
    checkPermission,
    checkReadPermission,
    checkWritePermission,
    checkDeletePermission,
    checkCreatePermission,
    checkEditPermission,
    checkViewPermission,
    checkActionPermission,
    checkAnyPermission,

    // UI helpers
    getPermissionLevelForModule,
    getUIPermissionsForModule,

    // Module-level
    canAccessDashboard,
    canManageRoles,
    canManageUsers,
    canManageClients,
    canManageProjects,
    canManageComplaints,
    canManageInstallers,
    canManageParts,
    canManageCategories,
    // canManageCustomers,
    isSuperAdmin,

    // Action-level
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canCreateRole,
    canEditRole,
    canDeleteRole,
    canCreateClient,
    canEditClient,
    canDeleteClient,
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canCreateComplaint,
    canEditComplaint,
    canDeleteComplaint,
    canCreateInstaller,
    canEditInstaller,
    canDeleteInstaller,
    canCreateParts,
    canEditParts,
    canDeleteParts,
    canCreateCategory,
    canEditCategory,
    canDeleteCategory,

    // Constants
    MODULES,
    PERMISSION_LEVELS,
    PERMISSION_ACTIONS,
  };
};
