"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save } from "lucide-react";
import { Input, Select, Spin } from "antd";
import useGetQuery from "../../../../hooks/getQuery.hook";
import usePutQuery from "../../../../hooks/putQuery.hook";
import { apiUrls } from "../../../../apis";
import { MODULES } from "../../../../utils/permissions";
import PermissionGuard from "../../../../components/PermissionGuard";
import CommonButton from "../../../../components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const { Option } = Select;

function EditUserContent() {
  const { messageApi } = useUIProvider();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { getQuery } = useGetQuery();
  const { putQuery } = usePutQuery();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    emailId: "",
    mobileNumber: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await getQuery({
          url: apiUrls.getAllRoles,
          onSuccess: (response: any) => {
            if (response.success || response.status === "success") {
              const rolesData = response.roles || response.data || [];
              setRoles(rolesData);
            }
          },
          onFail: (error: any) => {
            console.error("Failed to load roles:", error);
          },
        });

        await getQuery({
          url: `${apiUrls.getUserById}/${userId}`,
          onSuccess: (response: any) => {
            if (response.success || response.status === "success") {
              const userData = response.user || response.data;

              const roleId =
                userData.roleId ||
                userData.assignedRole?._id ||
                userData.assignedRole?.id ||
                userData.role?._id ||
                userData.role?.id ||
                "";

              const newFormData = {
                userName: userData.userName || "",
                emailId: userData.emailId || "",
                mobileNumber: userData.mobileNumber || "",
                roleId: roleId,
                password: "",
                confirmPassword: "",
              };
              setFormData(newFormData);
            } else {
              console.error("User data response not successful:", response);
            }
          },
          onFail: (error: any) => {
            console.error("Failed to load user data:", error);
            messageApi.error("Failed to load user data");
          },
        });
      } catch (error) {
        messageApi.error("An error occurred while loading data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleCancel = () => {
    router.push("/dashboard/usermanagement");
  };

  const handleSubmit = async () => {
    if (!formData.userName.trim()) {
      messageApi.error("User name is required");
      return;
    }
    if (!formData.emailId.trim()) {
      messageApi.error("Email is required");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      messageApi.error("Mobile number is required");
      return;
    }
    if (!formData.roleId) {
      messageApi.error("Role is required");
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      messageApi.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const updateData: any = {
        userName: formData.userName,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        assignedRole: formData.roleId,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await putQuery({
        url: `${apiUrls.updateUser}/${userId}`,
        putData: updateData,
        onSuccess: (response: any) => {
          if (response.success || response.status === "success") {
            messageApi.success("User updated successfully");
            router.push("/dashboard/usermanagement");
          } else {
            messageApi.error(response.message || "Failed to update user");
          }
        },
        onFail: (error: any) => {
          if (error?.data?.message) {
            messageApi.error(error.data.message);
          } else if (error?.message) {
            messageApi.error(error.message);
          } else {
            messageApi.error("Failed to update user");
          }
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
      messageApi.error("An error occurred");
    } finally {
      setLoading(false);
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
    <div className="bg-white p-0 sm:p-6 lg:p-6 max-w-8xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-0 md:mb-8 md:mt-0 mt-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Edit User
          </h1>
        </div>
        <div className="hidden sm:flex justify-end gap-3 lg:gap-5">
          <CommonButton
            icon={<Save size={16} />}
            label="Save"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            variant="primary"
          />
          <CommonButton label="Cancel" onClick={handleCancel} />
        </div>
      </div>

      {/* Breadcrumbs */}

      <div className="border-2 border-[#E2F2C3] shadow-lg rounded-lg p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            User Name *
          </label>
          <Input
            placeholder="Enter user name"
            value={formData.userName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, userName: e.target.value }))
            }
            style={{ height: 40 }}
            className="text-sm sm:text-base"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            Email *
          </label>
          <Input
            type="email"
            placeholder="Enter email address"
            value={formData.emailId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, emailId: e.target.value }))
            }
            style={{ height: 40 }}
            className="text-sm sm:text-base"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            Mobile Number *
          </label>
          <Input
            placeholder="Enter mobile number"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }))
            }
            style={{ height: 40 }}
            className="text-sm sm:text-base"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            Role *
          </label>
          <Select
            placeholder="Select a role"
            value={formData.roleId}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, roleId: value }))
            }
            style={{ width: "100%", height: 40 }}
            className="text-sm sm:text-base"
          >
            {roles.map((role: any) => (
              <Option key={role._id || role.id} value={role._id || role.id}>
                {role?.roleName}
              </Option>
            ))}
          </Select>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            New Password (leave blank to keep current)
          </label>
          <Input.Password
            placeholder="Enter new password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            style={{ height: 40 }}
            className="text-sm sm:text-base"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block font-semibold text-xs sm:text-sm text-gray-700 mb-2">
            Confirm New Password
          </label>
          <Input.Password
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            style={{ height: 40 }}
            className="text-base"
          />
        </div>
      </div>

      <div className="sm:hidden mt-6 flex flex-row gap-3">
        <CommonButton
          icon={<Save size={16} />}
          label="Save"
          onClick={handleSubmit}
          loading={loading}
          type="primary"
          variant="primary"
          className="flex-1"
        />
        <CommonButton
          label="Cancel"
          onClick={handleCancel}
          className="flex-1"
        />
      </div>
    </div>
  );
}

export default function EditUser() {
  return (
    <PermissionGuard
      module={MODULES.ADMIN_MANAGEMENT}
      permissionLevel="write"
      redirectTo="/dashboard/usermanagement"
      action={undefined}
    >
      <EditUserContent />
    </PermissionGuard>
  );
}
