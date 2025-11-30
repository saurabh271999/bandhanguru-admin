import { storageConstants } from "../constants/storageConstants";

export const MODULES = {
  DASHBOARD: "dashboard",
  ROLE_MANAGEMENT: "role_management",
  ADMIN_MANAGEMENT: "admin_management",
  AGENT_MANAGEMENT: "agent_management",
  PROJECT_MANAGEMENT: "project_management",
  VIEW_COMPLAINTS: "view_complaints",
  COMPLAINT_MANAGEMENT: "complaint_management",
  INSTALLER_MANAGEMENT: "installer_management",
  VENDOR_MANAGEMENT: "vendor_management",
  CATEGORY_MANAGEMENT: "category_management",
  CUSTOMER_MANAGEMENT: "customer_management",
};

export const PERMISSION_LEVELS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
};

export const PERMISSION_ACTIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_STATS: "view_stats",
  VIEW_ACTIVITY: "view_activity",
  VIEW_PERFORMANCE: "view_performance",

  // Role Management
  VIEW_ROLES: "view_roles",
  CREATE_ROLE: "create_role",
  EDIT_ROLE: "edit_role",
  DELETE_ROLE: "delete_role",
  MANAGE_PERMISSIONS: "manage_permissions",

  // Admin Management
  VIEW_USERS: "view_users",
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",
  ASSIGN_ROLES: "assign_roles",

  // Agent Management
  VIEW_CLIENTS: "view_clients",
  CREATE_CLIENT: "create_client",
  EDIT_CLIENT: "edit_client",
  DELETE_CLIENT: "delete_client",

  // Project Management
  VIEW_PROJECTS: "view_projects",
  CREATE_PROJECT: "create_project",
  EDIT_PROJECT: "edit_project",
  DELETE_PROJECT: "delete_project",
  UPDATE_PROGRESS: "update_progress",

  // Complaint Management
  VIEW_COMPLAINTS: "view_complaints",
  CREATE_COMPLAINT: "create_complaint",
  EDIT_COMPLAINT: "edit_complaint",
  DELETE_COMPLAINT: "delete_complaint",
  ADD_COMMENT: "add_comment",
  UPDATE_RATING: "update_rating",

  // Vendor Management
  VIEW_PARTS: "view_parts",
  CREATE_PARTS: "create_parts",
  EDIT_PARTS: "edit_parts",
  DELETE_PARTS: "delete_parts",
  ADD_PARTS: "add_parts",

  // CATEGORY Management
  VIEW_CATEGORIES: "view_categories",
  CREATE_CATEGORY: "create_category",
  EDIT_CATEGORY: "edit_category",
  DELETE_CATEGORY: "delete_category",
  ADD_CATEGORY: "add_category",

  // Customer Management
  VIEW_CUSTOMERS: "view_customers",
  CREATE_CUSTOMER: "create_customer",
  EDIT_CUSTOMER: "edit_customer",
  DELETE_CUSTOMER: "delete_customer",
};

// Enhanced permission checking functions
export const hasPermission = (userPermissions, module, permissionLevel) => {
  if (!userPermissions || !module) return false;

  const modulePermissions = userPermissions[module];
  if (!modulePermissions) return false;

  return modulePermissions[permissionLevel] === true;
};

export const canRead = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSION_LEVELS.READ);
};

export const canWrite = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSION_LEVELS.WRITE);
};

export const canDelete = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSION_LEVELS.DELETE);
};

// Enhanced permission checking for UI components
export const canCreate = (userPermissions, module) => {
  // To create, user needs write permission
  return canWrite(userPermissions, module);
};

export const canEdit = (userPermissions, module) => {
  // To edit, user needs write permission
  return canWrite(userPermissions, module);
};

export const canView = (userPermissions, module) => {
  // To view, user needs read permission OR any other permission (delete-only users can view)
  return (
    canRead(userPermissions, module) ||
    canWrite(userPermissions, module) ||
    canDelete(userPermissions, module)
  );
};

// Get permission level for UI rendering
export const getPermissionLevel = (userPermissions, module) => {
  if (!userPermissions || !module) return "none";

  const modulePermissions = userPermissions[module];
  if (!modulePermissions) return "none";

  const hasRead = modulePermissions.read === true;
  const hasWrite = modulePermissions.write === true;
  const hasDelete = modulePermissions.delete === true;

  if (hasRead && hasWrite && hasDelete) return "full";
  if (hasRead && hasWrite) return "read-write";
  if (hasRead && hasDelete) return "read-delete";
  if (hasRead) return "read-only";
  if (hasWrite) return "write-only";
  if (hasDelete) return "delete-only";

  return "none";
};

// Check if user can perform specific action
export const canPerformAction = (userPermissions, action) => {
  if (!userPermissions || !action) return false;

  // Map actions to modules and permission levels
  const actionMap = {
    [PERMISSION_ACTIONS.VIEW_DASHBOARD]: {
      module: MODULES.DASHBOARD,
      level: PERMISSION_LEVELS.READ,
    },
    [PERMISSION_ACTIONS.CREATE_ROLE]: {
      module: MODULES.ROLE_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_ROLE]: {
      module: MODULES.ROLE_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_ROLE]: {
      module: MODULES.ROLE_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_USER]: {
      module: MODULES.ADMIN_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_USER]: {
      module: MODULES.ADMIN_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_USER]: {
      module: MODULES.ADMIN_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_CLIENT]: {
      module: MODULES.AGENT_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_CLIENT]: {
      module: MODULES.AGENT_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_CLIENT]: {
      module: MODULES.AGENT_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_PROJECT]: {
      module: MODULES.PROJECT_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_PROJECT]: {
      module: MODULES.PROJECT_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_PROJECT]: {
      module: MODULES.PROJECT_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },

    // COMPLAINT ACTIONS - Using VIEW_COMPLAINTS for consistency with your hook
    [PERMISSION_ACTIONS.CREATE_COMPLAINT]: {
      module: MODULES.VIEW_COMPLAINTS,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_COMPLAINT]: {
      module: MODULES.VIEW_COMPLAINTS,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_COMPLAINT]: {
      module: MODULES.VIEW_COMPLAINTS,
      level: PERMISSION_LEVELS.DELETE,
    },

    // INSTALLER ACTIONS
    [PERMISSION_ACTIONS.CREATE_INSTALLER]: {
      module: MODULES.INSTALLER_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_INSTALLER]: {
      module: MODULES.INSTALLER_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_INSTALLER]: {
      module: MODULES.INSTALLER_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_PARTS]: {
      module: MODULES.VENDOR_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_PARTS]: {
      module: MODULES.VENDOR_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_PARTS]: {
      module: MODULES.VENDOR_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_CATEGORY]: {
      module: MODULES.CATEGORY_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_CATEGORY]: {
      module: MODULES.CATEGORY_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_CATEGORY]: {
      module: MODULES.CATEGORY_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
    [PERMISSION_ACTIONS.CREATE_CUSTOMER]: {
      module: MODULES.CUSTOMER_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.EDIT_CUSTOMER]: {
      module: MODULES.CUSTOMER_MANAGEMENT,
      level: PERMISSION_LEVELS.WRITE,
    },
    [PERMISSION_ACTIONS.DELETE_CUSTOMER]: {
      module: MODULES.CUSTOMER_MANAGEMENT,
      level: PERMISSION_LEVELS.DELETE,
    },
  };

  const actionConfig = actionMap[action];
  if (!actionConfig) return false;

  return hasPermission(
    userPermissions,
    actionConfig.module,
    actionConfig.level
  );
};

// Get user permissions from storage
export const getUserPermissions = () => {
  try {
    const userData = localStorage.getItem(storageConstants.USER_DATA);
    if (!userData) return {};

    const user = JSON.parse(userData);
    if (!user || !user.assignedRole || !user.assignedRole.permissions) {
      return {};
    }

    // Convert backend permissions format to frontend format
    const permissions = {};
    user.assignedRole.permissions.forEach((perm) => {
      permissions[perm.module] = {
        read: perm.permissions.read || false,
        write: perm.permissions.write || false,
        delete: perm.permissions.delete || false,
      };
    });

    return permissions;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return {};
  }
};

// Get current user from storage
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(storageConstants.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Check if user has any permission for a module
export const hasAnyPermission = (userPermissions, module) => {
  if (!userPermissions || !module) return false;

  const modulePermissions = userPermissions[module];
  if (!modulePermissions) return false;

  return (
    modulePermissions.read ||
    modulePermissions.write ||
    modulePermissions.delete
  );
};

// Get accessible modules for the user
export const getAccessibleModules = (userPermissions) => {
  if (!userPermissions) return [];

  return Object.keys(MODULES).filter((moduleKey) => {
    const moduleData = MODULES[moduleKey];
    return hasAnyPermission(userPermissions, moduleData);
  });
};

// Enhanced permission checking for UI rendering
export const getUIPermissions = (userPermissions, module) => {
  const level = getPermissionLevel(userPermissions, module);

  return {
    canView: canView(userPermissions, module),
    canCreate: canCreate(userPermissions, module),
    canEdit: canEdit(userPermissions, module),
    canDelete: canDelete(userPermissions, module),
    level: level,
    // UI-specific flags
    showAddButton: canCreate(userPermissions, module),
    showEditButton: canEdit(userPermissions, module),
    showDeleteButton: canDelete(userPermissions, module),
    disableAddButton: !canCreate(userPermissions, module),
    disableEditButton: !canEdit(userPermissions, module),
    disableDeleteButton: !canDelete(userPermissions, module),
  };
};
