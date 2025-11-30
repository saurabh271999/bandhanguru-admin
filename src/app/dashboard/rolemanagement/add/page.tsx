"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Checkbox, Spin } from "antd";
import usePostQuery from "../../../hooks/postQuery.hook";
import { apiUrls } from "../../../apis";
import CommonButton from "../../../components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import { usePermissions } from "../../../hooks/usePermissions";
import { RoleManagementRouteGuard } from "../../../components/PermissionGuard";

// export default function AddRole() {
function AddRoleContent() {
  const { messageApi } = useUIProvider();
  const { isSuperAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false after component mounts
  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCancel = () => {
    router.push("/dashboard/usermanagement");
  };
  const router = useRouter();
  const { postQuery } = usePostQuery();
  const [loading, setLoading] = useState(false);

  // Convert API permissions structure to form structure
  const convertPermissionsToForm = (apiPermissions: any) => {
    if (!apiPermissions || !Array.isArray(apiPermissions)) {
      return {
        dashboard: { read: false, write: false, active_inactive: false },
        role_management: { read: false, write: false, active_inactive: false },
        admin_management: { read: false, write: false, active_inactive: false },
        agent_management: {
          read: false,
          write: false,
          active_inactive: false,
        },
        vendor_management: {
          read: false,
          write: false,
          active_inactive: false,
        },
        category_management: {
          read: false,
          write: false,
          active_inactive: false,
        },
        view_complaints: { read: false, write: false, active_inactive: false },
        installer_management: {
          read: false,
          write: false,
          active_inactive: false,
        },
      };
    }

    const formPermissions: any = {};
    apiPermissions.forEach((perm: any) => {
      formPermissions[perm.module] = {
        read: perm.permissions.read || false,
        write: perm.permissions.write || false,
        delete: perm.permissions.delete || false,
      };
    });

    return formPermissions;
  };

  // Convert form permissions back to API structure
  const convertFormToApiPermissions = (formPermissions: any) => {
    const apiPermissions: any = [];
    Object.keys(formPermissions).forEach((module) => {
      apiPermissions.push({
        module: module,
        permissions: {
          read: formPermissions[module].read || false,
          write: formPermissions[module].write || false,
          delete: formPermissions[module].delete || false,
        },
      });
    });
    return apiPermissions;
  };

  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
    permissions: convertPermissionsToForm([]),
  });

  const handlePermissionChange = (
    module: string,
    permission: string,
    checked: boolean
  ) => {
    // Restrict dashboard and role_management permissions to admin/superadmin only
    if (
      (module === "dashboard" || module === "role_management") &&
      !isSuperAdmin()
    ) {
      messageApi.warning(
        "Only Admin and Super Admin can assign Dashboard and Role Management permissions"
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permission]: checked,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.roleName.trim()) {
      messageApi.error("Role name is required");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const apiData = {
        roleName: formData.roleName.trim(),
        description: formData.description.trim() || "",
        permissions: convertFormToApiPermissions(formData.permissions),
      };

      await postQuery({
        url: apiUrls.createRole,
        postData: apiData,
        headers: {
          "Content-Type": "application/json",
        },
        onSuccess: (response: any) => {
          if (
            response.success ||
            response.status === "success" ||
            response.message
          ) {
            messageApi.success(response.message || "Role created successfully");
            router.push("/dashboard/rolemanagement");
          } else {
            messageApi.error("Unexpected response format");
          }
        },
        onFail: (error: any) => {
          if (error?.data?.error?.message) {
            messageApi.error(error.data.error.message);
          } else if (error?.data?.message) {
            messageApi.error(error.data.message);
          } else if (error?.message) {
            messageApi.error(error.message);
          } else if (error?.error?.message) {
            messageApi.error(error.error.message);
          } else if (
            error?.error?.details &&
            Array.isArray(error.error.details)
          ) {
            const fieldErrors = error.error.details
              .map((detail: any) => `${detail.field}: ${detail.message}`)
              .join(", ");
            messageApi.error(`Validation errors: ${fieldErrors}`);
          } else if (error?.response?.data?.message) {
            messageApi.error(error.response.data.message);
          } else if (error?.response?.data?.error?.message) {
            messageApi.error(error.response.data.error.message);
          } else {
            messageApi.error("Failed to create role. Please try again.");
          }
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
      messageApi.error("An error occurred while creating the role");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white p-0 sm:p-6 lg:p-8 max-w-8xl mx-auto min-h-screen">
      <div className="mb-2 md:mb-8 md:mt-0 mt-2">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">
          Assign Roles & Permissions
        </h1>
      </div>
      <div className="border-2 border-[#E2F2C3] shadow-lg rounded-lg p-2 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Role
          </label>
          <Input
            placeholder="Enter role name"
            value={formData.roleName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, roleName: e.target.value }))
            }
            className="w-full"
            style={{
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <Input.TextArea
            placeholder="Enter role description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-[#000000] mb-4">
            Permissions
          </h2>

          <div className="hidden md:block border border-[#C0C0C0] rounded-[6px] overflow-hidden">
            <div className="bg-[#F2F2F2] px-4 py-3 border-b border-[#C0C0C0]">
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium text-[#000000]">Permissions</div>
                <div className="font-medium text-[#000000] text-center">
                  Read
                </div>
                <div className="font-medium text-[#000000] text-center">
                  Write
                </div>
                <div className="font-medium text-[#000000] text-center">
                  Active/Inactive
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Dashboard */}
              {/* <div className="px-4 py-3">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">Dashboard</div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.dashboard?.read || false}
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "dashboard",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.dashboard?.write || false}
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "dashboard",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={formData.permissions.dashboard?.delete || false}
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "dashboard",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div> */}

              {/* Role Management */}
              <div className="px-4 py-3">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">
                    Role Management
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.role_management?.read || false
                      }
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "role_management",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.role_management?.write || false
                      }
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "role_management",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.role_management?.delete || false
                      }
                      disabled={!isSuperAdmin()}
                      onChange={(e) =>
                        handlePermissionChange(
                          "role_management",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Admin Management */}
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">
                    Bandhan Guru Team
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.admin_management?.read || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "admin_management",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.admin_management?.write || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "admin_management",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.admin_management?.delete || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "admin_management",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Agent Management */}
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">
                    Agent Management
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.agent_management?.read || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "agent_management",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.agent_management?.write || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "agent_management",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.agent_management?.delete || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "agent_management",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Agent Management */}
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">
                    Vendor Management
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.vendor_management?.read || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "vendor_management",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.vendor_management?.write || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "vendor_management",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.vendor_management?.delete || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "vendor_management",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Category Management */}
              <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-[#000000]">
                    Category Management
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.category_management?.read || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "category_management",
                          "read",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.category_management?.write || false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "category_management",
                          "write",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={
                        formData.permissions.category_management?.delete ||
                        false
                      }
                      onChange={(e) =>
                        handlePermissionChange(
                          "category_management",
                          "delete",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Permissions Cards */}
          <div className="md:hidden space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-[#000000] mb-3">
                Role Management
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Read</span>
                  <Checkbox
                    checked={
                      formData.permissions.role_management?.read || false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "role_management",
                        "read",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Write</span>
                  <Checkbox
                    checked={
                      formData.permissions.role_management?.write || false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "role_management",
                        "write",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">
                    Active/Inactive
                  </span>
                  <Checkbox
                    checked={
                      formData.permissions.role_management?.active_inactive ||
                      false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "role_management",
                        "active_inactive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Admin Management Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-[#000000] mb-3">
                Admin Management
              </h3>
              <div className="">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Read</span>
                  <Checkbox
                    checked={
                      formData.permissions.admin_management?.read || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "admin_management",
                        "read",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Write</span>
                  <Checkbox
                    checked={
                      formData.permissions.admin_management?.write || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "admin_management",
                        "write",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">
                    Active/Inactive
                  </span>
                  <Checkbox
                    checked={
                      formData.permissions.admin_management?.active_inactive ||
                      false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "admin_management",
                        "active_inactive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Agent Management Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-[#000000] mb-3">
                Agent Management
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Read</span>
                  <Checkbox
                    checked={
                      formData.permissions.agent_management?.read || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "agent_management",
                        "read",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Write</span>
                  <Checkbox
                    checked={
                      formData.permissions.agent_management?.write || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "agent_management",
                        "write",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">
                    Active/Inactive
                  </span>
                  <Checkbox
                    checked={
                      formData.permissions.agent_management?.active_inactive ||
                      false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "agent_management",
                        "active_inactive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Vendor Management Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-[#000000] mb-3">
                Vendor Management
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Read</span>
                  <Checkbox
                    checked={
                      formData.permissions.vendor_management?.read || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "vendor_management",
                        "read",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Write</span>
                  <Checkbox
                    checked={
                      formData.permissions.vendor_management?.write || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "vendor_management",
                        "write",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">
                    Active/Inactive
                  </span>
                  <Checkbox
                    checked={
                      formData.permissions.vendor_management?.active_inactive ||
                      false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "vendor_management",
                        "active_inactive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Category Management Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-[#000000] mb-3">
                Category Management
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Read</span>
                  <Checkbox
                    checked={
                      formData.permissions.category_management?.read || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "category_management",
                        "read",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">Write</span>
                  <Checkbox
                    checked={
                      formData.permissions.category_management?.write || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "category_management",
                        "write",
                        e.target.checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#000000]">
                    Active/Inactive
                  </span>
                  <Checkbox
                    checked={
                      formData.permissions.category_management
                        ?.active_inactive || false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "category_management",
                        "active_inactive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-row space-x-3 sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <CommonButton label="Cancel" onClick={handleCancel} />
          <CommonButton
            label="Submit"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}

export default function AddRole() {
  return (
    <RoleManagementRouteGuard>
      <AddRoleContent />
    </RoleManagementRouteGuard>
  );
}
