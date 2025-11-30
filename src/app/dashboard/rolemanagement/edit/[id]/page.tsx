"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button, Input, Checkbox, Spin } from "antd";
import useGetQuery from "../../../../hooks/getQuery.hook";
import usePutQuery from "../../../../hooks/putQuery.hook";
import { apiUrls } from "../../../../apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import { usePermissions } from "../../../../hooks/usePermissions";
import { RoleManagementRouteGuard } from "../../../../components/PermissionGuard";

function EditRoleContent() {
  const { messageApi } = useUIProvider();
  const { isSuperAdmin } = usePermissions();

  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const { getQuery } = useGetQuery();
  const { putQuery } = usePutQuery();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
    permissions: {} as any,
  });

  // Convert API permissions structure to form structure
  const convertPermissionsToForm = (apiPermissions: any) => {
    if (!apiPermissions || !Array.isArray(apiPermissions)) {
      return {
        role_management: { read: false, write: false, delete: false },
        admin_management: { read: false, write: false, delete: false },
        agent_management: { read: false, write: false, delete: false },
        project_management: { read: false, write: false, delete: false },
        view_complaints: { read: false, write: false, delete: false },
        installer_management: { read: false, write: false, delete: false },
        vendor_management: { read: false, write: false, delete: false },
        category_management: { read: false, write: false, delete: false },
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
    if (!formPermissions || typeof formPermissions !== "object") {
      return apiPermissions;
    }

    Object.keys(formPermissions).forEach((module) => {
      if (
        formPermissions[module] &&
        typeof formPermissions[module] === "object"
      ) {
        apiPermissions.push({
          module: module,
          permissions: {
            read: formPermissions[module].read || false,
            write: formPermissions[module].write || false,
            delete: formPermissions[module].delete || false,
          },
        });
      }
    });
    return apiPermissions;
  };

  // Load role data
  useEffect(() => {
    const loadRole = async () => {
      try {
        const result = await getQuery({
          url: `${apiUrls.getRoleById}/${roleId}`,
          onSuccess: (response: any) => {
            if (response.success || response.status === "success") {
              const roleData = response.role || response.data;
              setFormData({
                roleName: roleData.roleName || "",
                description: roleData.description || "",
                permissions: convertPermissionsToForm(roleData.permissions),
              });
            }
          },
          onFail: (error: any) => {
            messageApi.error("Failed to load role data");
            console.error("Error loading role:", error);
          },
        });
      } catch (error) {
        messageApi.error("An error occurred while loading role");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      loadRole();
    }
  }, [roleId]);

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
          read: prev.permissions[module]?.read || false,
          write: prev.permissions[module]?.write || false,
          delete: prev.permissions[module]?.delete || false,
          [permission]: checked,
        },
      },
    }));
  };

  const handleModuleAllChange = (module: string, checked: boolean) => {
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

    const modulePermissions =
      formData.permissions[module as keyof typeof formData.permissions];

    // Safety check: if modulePermissions is undefined, use default permissions
    if (!modulePermissions) {
      const defaultPermissions = {
        read: false,
        write: false,
        delete: false,
      };

      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: { ...defaultPermissions },
        },
      }));
      return;
    }

    const updatedPermissions: any = {};

    Object.keys(modulePermissions).forEach((permission) => {
      updatedPermissions[permission] = checked;
    });

    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: updatedPermissions,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.roleName.trim()) {
      messageApi.error("Role name is required");
      return;
    }

    try {
      // Convert form permissions back to API format
      const apiData = {
        ...formData,
        permissions: convertFormToApiPermissions(formData.permissions),
      };

      const result = await putQuery({
        url: `${apiUrls.updateRole}/${roleId}`,
        putData: apiData,
        onSuccess: (response: any) => {
          if (response.success || response.status === "success") {
            messageApi.success("Role updated successfully");
            router.push("/dashboard/rolemanagement");
          } else {
            messageApi.error(response.message || "Failed to update role");
          }
        },
        onFail: (error: any) => {
          console.error("Role update error:", JSON.stringify(error, null, 2));
          if (error?.data?.message) {
            messageApi.error(error.data.message);
          } else if (error?.message) {
            messageApi.error(error.message);
          } else {
            messageApi.error("Failed to update role");
          }
        },
      });
    } catch (error) {
      messageApi.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-2 md:mb-8 md:mt-0 mt-2">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800 mb-2">
          Edit Role
        </h1>
      </div>
      <div className="bg-white w-full rounded-lg shadow-lg p-2 md:p-6 border border-[#A3D471] flex flex-col">
        {/* Role Name */}
        <div className="mb-6">
          <label className="block font-semibold text-sm text-gray-700 mb-2">
            Role Name *
          </label>
          <Input
            placeholder="Enter the role name"
            value={formData.roleName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, roleName: e.target.value }))
            }
            style={{ height: 45 }}
            className="text-base"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold text-sm text-gray-700 mb-2">
            Description
          </label>
          <Input.TextArea
            placeholder="Enter role description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="text-base"
          />
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            Assign Permissions
          </h3>

          {/* Role Management */}
          <div className="mb-6 p-2 md:p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">ROLE MANAGEMENT</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.role_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.role_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.role_management || {}
                    ).every(Boolean)
                  }
                  disabled={!isSuperAdmin()}
                  onChange={(e) =>
                    handleModuleAllChange("role_management", e.target.checked)
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.role_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.role_management?.[permission] ||
                      false
                    }
                    disabled={!isSuperAdmin()}
                    onChange={(e) =>
                      handlePermissionChange(
                        "role_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div>

          {/* Admin Management */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">ADMIN MANAGEMENT</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.admin_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.admin_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.admin_management || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange("admin_management", e.target.checked)
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.admin_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.admin_management?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "admin_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div>

          {/* Agent Management */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">AGENT MANAGEMENT</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.agent_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.agent_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.agent_management || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange("agent_management", e.target.checked)
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.agent_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.agent_management?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "agent_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div>

          {/* Project Management */}
          {/* <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">
                PROJECT MANAGEMENT
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.project_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.project_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.project_management || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange(
                      "project_management",
                      e.target.checked
                    )
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.project_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.project_management?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "project_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div> */}

          {/* View Complaints */}
          {/* <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">VIEW COMPLAINTS</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.view_complaints || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.view_complaints || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.view_complaints || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange("view_complaints", e.target.checked)
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.view_complaints || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.view_complaints?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "view_complaints",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div> */}

          {/* Vendor Management */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">
                VENDOR MANAGEMENT
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.vendor_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.vendor_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.vendor_management || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange("vendor_management", e.target.checked)
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.vendor_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.vendor_management?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "vendor_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div>

          {/* Category Management */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-[#000000]">
                CATEGORY MANAGEMENT
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={Object.values(
                    formData.permissions.category_management || {}
                  ).every(Boolean)}
                  indeterminate={
                    Object.values(
                      formData.permissions.category_management || {}
                    ).some(Boolean) &&
                    !Object.values(
                      formData.permissions.category_management || {}
                    ).every(Boolean)
                  }
                  onChange={(e) =>
                    handleModuleAllChange(
                      "category_management",
                      e.target.checked
                    )
                  }
                >
                  Select All
                </Checkbox>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.keys(formData.permissions.category_management || {}).map(
                (permission) => (
                  <Checkbox
                    key={permission}
                    checked={
                      formData.permissions.category_management?.[permission] ||
                      false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        "category_management",
                        permission,
                        e.target.checked
                      )
                    }
                  >
                    {permission.toUpperCase()}
                  </Checkbox>
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-6">
          <Button
            type="primary"
            icon={<Save size={16} />}
            onClick={handleSubmit}
            size="large"
            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-700)]"
            style={{
              backgroundColor: "#274699",
            }}
          >
            Update Role
          </Button>
        </div>
      </div>

      {/* Header */}
    </div>
  );
}

export default function EditRole() {
  return (
    <RoleManagementRouteGuard>
      <EditRoleContent />
    </RoleManagementRouteGuard>
  );
}
