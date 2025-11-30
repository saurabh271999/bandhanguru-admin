// export const apiBaseUrl = "http://localhost:8000";
export const apiBaseUrl = "https://13.203.127.118.nip.io";

export const apiUrls = {
  uploadPdf: "/api/v1/documents/upload-pdf",
  uploadImage: "/api/v1/documents/upload-image",
  uploadMedia: "/api/v1/documents/upload-video",

  // Authentication
  login: "/api/v1/auth/login",
  register: "/api/v1/auth/register",
  logout: "/api/v1/auth/logout",
  getCurrentUser: "/api/v1/auth/me",
  getUserPermissions: "/api/v1/auth/permissions",

  // Dashboard
  dashboardStats: "/api/v1/dashboard/stats",
  userActivity: "/api/v1/dashboard/user-activity",
  projectPerformance: "/api/v1/dashboard/project-performance",
  complaintResolution: "/api/v1/dashboard/complaint-resolution",
  vendorsByAgentDaily: "/api/v1/dashboard/vendors-by-agent-daily",

  // Admin Management
  createUser: "/api/v1/users/create",
  getAllUsers: "/api/v1/users/all",
  getAllUsersByRole: (role) => `/api/v1/users/byRole/${role}`,
  getAllClients: "/api/v1/users/clients",
  // userRouter.get('/:id', getUserById) - GET /api/v1/users/:id
  getUserById: "/api/v1/users",
  updateUser: "/api/v1/users",
  deleteUser: "/api/v1/users",
  getUserStats: "/api/v1/users/stats",
  getUsersByRole: "/api/v1/users/by-role",
  getUserDocuments: (userId) => `/api/v1/users/${userId}/documents`,

  // Role Management
  createRole: "/api/v1/roles/create",
  getAllRoles: "/api/v1/roles/",
  getRoleById: "/api/v1/roles",
  updateRole: "/api/v1/roles",
  deleteRole: "/api/v1/roles",
  getRoleStats: "/api/v1/roles/stats",
  getAvailableModules: "/api/v1/roles/modules",

  // Agent Management
  createClient: "/api/v1/clients/create",
  getClientById: "/api/v1/clients",
  updateClient: "/api/v1/clients",
  deleteClient: "/api/v1/clients",
  getClientStats: "/api/v1/clients/stats",
  // getVendorTypes: "/api/vendors/types",
  getagentTypes: "/api/v1/users/agent/types",

  // Location Management
  getStates: "/api/v1/locations/states",
  getDivisions: (stateId) => `/api/v1/locations/states/${stateId}/divisions`,
  getDistricts: (stateId, divisionId) =>
    `/api/v1/locations/states/${stateId}/divisions/${divisionId}/districts`,
  getStateDistricts: (stateId) =>
    `/api/v1/locations/states/${stateId}/districts`,
  getRoleSuggestions: (targetRole, selectedState, selectedDivision) => {
    const baseUrl = "/api/v1/locations/role-suggestions";
    const params = new URLSearchParams({ targetRole });
    if (selectedState) params.append("selectedState", selectedState);
    if (selectedDivision) params.append("selectedDivision", selectedDivision);
    return `${baseUrl}?${params.toString()}`;
  },

  //Category Management
  createCategory: "/api/v1/categories/create",
  deleteCategoryId: (id) => `/api/v1/categories/${id}`,
  getAllCategories: "/api/v1/categories/",
  editCategoryById: (id) => `/api/v1/categories/${id}`,
  manageCategoryById: (id) => `/api/v1/categories/${id}/manage`,

  //Installer Management
  createInstaller: "/api/v1/installers/create",
  getInstallerById: "/api/v1/installers",
  updateInstaller: "/api/v1/installers",
  deleteInstaller: "/api/v1/installers",
  getAllInstallers: "/api/v1/installers/",
  getInstallerStats: "/api/v1/installers/stats",

  //toggle active status
  toggleActiveStatus: (model) => `/api/v1/toggle/${model}`,

  //Vendor management
  createVendor: "/api/v1/vendors/create",
  getAllVendors: "/api/v1/vendors",
  getAllVendorsAll: "/api/v1/vendors/all",
  getApprovedVendors: "/api/v1/vendors/approved",
  getVendorsWithSubscriptions: "/api/v1/vendors/with-subscriptions",
  getPaidSubscriptions: "/api/v1/subscriptions/paid",
  getVendorById: (id) => `/api/v1/vendors/${id}`,
  deleteVendor: (id) => `/api/v1/vendors/${id}`,
  toggleVendorStatus: (id) => `/api/v1/vendors/${id}/toggle-status`,

  // Advisor Forms Management
  createAdvisorForm: "/api/v1/advisor-forms",
  getAllAdvisorForms: "/api/v1/advisor-forms",
  getAdvisorFormById: (id) => `/api/v1/advisor-forms/${id}`,
  updateAdvisorForm: (id) => `/api/v1/advisor-forms/${id}`,
  deleteAdvisorForm: (id) => `/api/v1/advisor-forms/${id}`,
  uploadAdvisorImage: "/api/v1/advisor-forms/upload-image",
  uploadAdvisorImageDirect: "/api/v1/advisor-forms/upload-image-direct",
  uploadAdvisorDocument: (id) => `/api/v1/advisor-forms/${id}/upload`,
};
