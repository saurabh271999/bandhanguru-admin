"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useGetQuery from "../../../hooks/getQuery.hook";
import { apiUrls } from "../../../apis";
import apiClient from "../../../apis/apiClient";
import CommonButton from "../../../components/commonbtn";
import UploadDocument from "../../../components/upladDocument";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const AddUserPage = () => {
  const { messageApi, modal } = useUIProvider();
  const router = useRouter();
  const [phoneNumberValue, setPhoneNumberValue] = useState<
    string | undefined
  >();
  const [formData, setFormData] = useState({
    userName: "",
    mobileNumber: "",
    emailId: "",
    password: "",
    assignedRole: "",
    isActive: true,
    role: "admin",
    profileImage: "",
    agentCode: "",
  });
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { getQuery } = useGetQuery();

  const selectedRoleName = useMemo(() => {
    const r = roles.find((x) => x.value === formData.assignedRole);
    return (r?.label || "").toString();
  }, [roles, formData.assignedRole]);

  useEffect(() => {
    const loadRoles = async () => {
      setRolesLoading(true);
      try {
        await getQuery({
          url: apiUrls.getAllRoles + "?status=active",
          onSuccess: (response: any) => {
            let rolesArray: any[] = [];
            if (Array.isArray(response)) {
              rolesArray = response;
            } else if (response?.data?.data) {
              rolesArray = response.data.data;
            } else if (response?.data) {
              rolesArray = response.data;
            } else if (response?.roles) {
              rolesArray = response.roles;
            } else if (response?.result) {
              rolesArray = response.result;
            }

            if (!rolesArray.length) {
              messageApi.warning("No roles found.");
            }

            const roleOptions = rolesArray
              .map((role: any) => {
                if (role?._id && (role?.roleName || role?.name)) {
                  return { value: role._id, label: role.roleName || role.name };
                }
                return null;
              })
              .filter(Boolean);

            setRoles(roleOptions as { value: string; label: string }[]);
          },
          onFail: (error: any) => {
            setRoles([]);
            messageApi.error(error.message || "Failed to load roles");
          },
        });
      } catch {
        setRoles([]);
        messageApi.error("An unexpected error occurred while loading roles.");
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [getQuery]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumberValue(value);
    handleInputChange("mobileNumber", value || "");
  };

  const [uploadedDocument, setUploadedDocument] = useState<string>("");

  const handleSubmit = async () => {
    if (!formData.userName.trim()) {
      return messageApi.error("User name is required");
    }
    if (!formData.mobileNumber) {
      return messageApi.error("Mobile number is required");
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.emailId)) {
      return messageApi.error("A valid email is required");
    }
    if (!formData.password) {
      return messageApi.error("Password is required");
    }
    if (formData.password.length < 6) {
      return messageApi.error("Password must be at least 6 characters long");
    }
    if (!formData.assignedRole) {
      return messageApi.error("Please assign a role");
    }
    if (
      selectedRoleName.toLowerCase() === "agent" &&
      !formData.agentCode.trim()
    ) {
      return messageApi.error("Employee Code is required for Agent role");
    }
    if (!formData.profileImage) {
      console.log("  - formData.profileImage:", formData.profileImage);
      console.log("  - uploadedDocument:", uploadedDocument);
      return messageApi.error("Please upload a profile image");
    }

    console.log("✅ Validation passed, sending API request...", formData);
    console.log("📄 Uploaded document value:", uploadedDocument);
    console.log("🔍 Final formData being sent to API:", {
      ...formData,
      profileImage: formData.profileImage || uploadedDocument,
    });
    console.log(
      "  - Both values match?",
      uploadedDocument === formData.profileImage
    );

    setLoading(true);
    try {
      const payload = {
        ...formData,
        profileImage: formData.profileImage || uploadedDocument,
        userProfile: formData.profileImage || uploadedDocument,
        profile: formData.profileImage || uploadedDocument,
        profileData: {
          image: formData.profileImage || uploadedDocument,
        },
      };

      const res = await apiClient.post(apiUrls.createUser, payload);
      console.log("✅ API Success Response:", res.data);
      modal.success({
        title: "User Created Successfully",
        content: `${formData.userName} has been added to the system.`,
        okText: "OK",
        onOk: () => router.push("/dashboard/usermanagement"),
      });
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message || "Failed to create user"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/usermanagement");
  };

  return (
    <div className="p-0 sm:p-6 lg:p-6 bg-white rounded-lg">
      <div className="mb-2 md:mb-8 md:mt-0 mt-2">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
          Add New Admin
        </h1>
      </div>
      <div className="bg-white text-black w-full shadow-md rounded-lg p-2 md:p-6 border-2 border-[#E2F2C3] flex flex-col gap-y-4">
        <div>
          <label className="block font-semibold text-sm mb-1">
            User Name *
          </label>
          <Input
            placeholder="Enter user name"
            value={formData.userName}
            onChange={(e) => handleInputChange("userName", e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">
            Mobile Number *
          </label>
          <PhoneInput
            country={"in"}
            value={phoneNumberValue}
            onChange={handlePhoneChange}
            inputStyle={{ width: "100%", height: "40px" }}
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Email Id *</label>
          <Input
            type="email"
            placeholder="example@email.com"
            value={formData.emailId}
            onChange={(e) => handleInputChange("emailId", e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">Password *</label>
          <Input.Password
            placeholder="Enter password (min. 6 characters)"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1">
            Assign Role *
          </label>
          <Select
            size="large"
            placeholder={rolesLoading ? "Loading roles..." : "Select a role"}
            value={formData.assignedRole || null}
            onChange={(value) => handleInputChange("assignedRole", value)}
            style={{ width: "100%" }}
            options={roles}
            loading={rolesLoading}
            disabled={rolesLoading}
          />
        </div>
        {selectedRoleName.toLowerCase() === "agent" && (
          <div>
            <label className="block font-semibold text-sm mb-1">
              Employee Code *
            </label>
            <Input
              placeholder="Enter employee code"
              value={formData.agentCode}
              onChange={(e) => handleInputChange("agentCode", e.target.value)}
              size="large"
            />
          </div>
        )}

        <div>
          <label htmlFor="" className="block font-semibold text-sm mb-1">
            Upload Profile Image *
          </label>
          <UploadDocument
            value={uploadedDocument}
            onChange={(value) => {
              console.log("📄 Profile image uploaded:", value);
              setUploadedDocument(value);

              setFormData((prev) => ({ ...prev, profileImage: value }));
            }}
            variant="secondary"
            buttonHeight={150}
          />
          {uploadedDocument && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Profile image uploaded: {uploadedDocument.substring(0, 50)}...
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-row space-x-3 sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <CommonButton label="Cancel" onClick={handleCancel} />
          <CommonButton
            label="Submit"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            style={{ backgroundColor: "#274699" }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
