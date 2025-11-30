"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input, Select, Spin, Switch } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Save } from "lucide-react";
import CommonButton from "../../../../components/commonbtn";

const { Option } = Select;
import useGetQuery from "@/app/hooks/getQuery.hook";
import usePutQuery from "@/app/hooks/putQuery.hook";
import { apiUrls } from "@/app/apis";
import UploadDocument from "@/app/components/upladDocument";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

interface VendorFormData {
  // Auth & Identity
  userName: string;
  mobileNumber: string;
  emailId: string;
  password: string;
  select_agent: string; // holds agentCode
  isActive: boolean;

  // Business Info
  businessName: string;
  description: string;
  servicesOffered: string;
  priceList: string;
  address: string;
  pincode: string;

  // Category
  categoryId?: string;
  subcategoryId?: string;

  // Documents & Media
  aadharCard: string;
  panCard: string;
  businessImage?: string | null;
  aadhaarDoc?: string[]; // array of URLs
}

interface AgentOption {
  value: string;
  label: string;
}

const EditVendorPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;

  const { getQuery } = useGetQuery();
  const { putQuery } = usePutQuery();
  const { messageApi } = useUIProvider();

  const [formData, setFormData] = useState<VendorFormData>({
    userName: "",
    mobileNumber: "",
    emailId: "",
    password: "",
    select_agent: "",
    isActive: true,
    businessName: "",
    description: "",
    servicesOffered: "",
    priceList: "",
    address: "",
    pincode: "",
    categoryId: undefined,
    subcategoryId: undefined,
    aadharCard: "",
    panCard: "",
    businessImage: "",
    aadhaarDoc: [],
  });

  const [phoneNumberValue, setPhoneNumberValue] = useState<
    string | undefined
  >();
  const [agentUsers, setAgentUsers] = useState<AgentOption[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [aadhaarUrl, setAadhaarUrl] = useState<string>("");
  const [businessImageUrl, setBusinessImageUrl] = useState<string>("");

  // Fetch agent users (by role: agent), value as agentCode
  const fetchAgentUsers = async () => {
    try {
      setAgentLoading(true);
      await getQuery({
        url: apiUrls.getAllUsersByRole("agent"),
        onSuccess: (data: any) => {
          const users = data?.users || data?.data?.users || [];
          const agentUsersList = (users as any[])
            .filter((user: any) => user.agentCode)
            .map((user: any) => ({
              value: user.agentCode,
              label: `${user.userName || user.name || user.emailId} (${
                user.agentCode
              })`,
            }));
          setAgentUsers(agentUsersList);
        },
        onFail: (error: any) => {
          console.error("Error fetching agent users:", error);
          setAgentUsers([]);
        },
      });
    } catch (error) {
      console.error("Error fetching agent users:", error);
      setAgentUsers([]);
    } finally {
      setAgentLoading(false);
    }
  };

  // Fetch categories for selection
  const fetchCategories = async () => {
    await getQuery({
      url: apiUrls.getAllCategories,
      onSuccess: (res: any) => {
        const list = res?.categories || res?.data?.categories || res || [];
        setCategories(Array.isArray(list) ? list : []);
      },
      onFail: () => setCategories([]),
    });
  };

  // Fetch vendor data
  const fetchVendorData = async () => {
    try {
      setInitialLoading(true);
      await getQuery({
        url: apiUrls.getVendorById(vendorId),
        onSuccess: (data: any) => {
          console.log("Vendor API response:", data);

          const vendor = data?.vendor || data?.data || data;
          if (vendor) {
            const formDataToSet = {
              userName: vendor.userName || vendor.name || "",
              mobileNumber: vendor.mobileNumber || "",
              emailId: vendor.emailId || vendor.email || "",
              password: "", // Don't pre-fill password for security
              select_agent:
                vendor.agentCode ||
                vendor.assignedAgent ||
                vendor.select_agent ||
                "",
              isActive: vendor.isActive !== undefined ? vendor.isActive : true,
              businessName: vendor.businessName || "",
              description: vendor.description || "",
              servicesOffered: vendor.servicesOffered || "",
              priceList: vendor.priceList || "",
              address: vendor.address || "",
              pincode: vendor.pincode || "",
              categoryId:
                vendor.categoryId?._id || vendor.categoryId || undefined,
              subcategoryId: vendor.subcategoryId || undefined,
              aadharCard: vendor.aadharCard || "",
              panCard: vendor.panCard || "",
              businessImage: vendor.businessImage || "",
              aadhaarDoc: vendor.aadhaarDoc || [],
            };
            console.log("Setting form data:", formDataToSet);
            setFormData(formDataToSet);
            setPhoneNumberValue(vendor.mobileNumber || "");
            setAadhaarUrl(
              Array.isArray(vendor.aadhaarDoc) && vendor.aadhaarDoc[0]
                ? vendor.aadhaarDoc[0]
                : ""
            );
            setBusinessImageUrl(vendor.businessImage || "");
          } else {
            messageApi.error("Vendor not found");
            router.push("/dashboard/vendormanagement");
          }
        },
        onFail: (error: any) => {
          console.error("Error fetching vendor data:", error);
          const errorMessage =
            error?.response?.data?.message || "Failed to load vendor data";
          messageApi.error(errorMessage);
          router.push("/dashboard/vendormanagement");
        },
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      messageApi.error("Failed to load vendor data");
      router.push("/dashboard/vendormanagement");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
      fetchAgentUsers();
      fetchCategories();
    }
  }, [vendorId]);

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumberValue(value);
    handleInputChange("mobileNumber", value || "");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.userName.trim()) {
      messageApi.error("Vendor name is required");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      messageApi.error("Mobile number is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.emailId)) {
      messageApi.error("A valid email is required");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      messageApi.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        userName: formData.userName,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        agentCode: formData.select_agent || undefined,
        role: "vendor",
        isActive: formData.isActive,

        businessName: formData.businessName,
        description: formData.description,
        servicesOffered: formData.servicesOffered,
        priceList: formData.priceList,
        address: formData.address,
        pincode: formData.pincode,

        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,

        aadharCard: formData.aadharCard,
        panCard: formData.panCard?.toUpperCase(),
        businessImage: businessImageUrl || formData.businessImage || null,
        aadhaarDoc: aadhaarUrl ? [aadhaarUrl] : formData.aadhaarDoc || [],
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log(
        "Updating vendor with data:",
        JSON.stringify(updateData, null, 2)
      );

      const result = await putQuery({
        url: apiUrls.getVendorById(vendorId),
        putData: updateData,
        onSuccess: (response: any) => {
          console.log("Vendor update success response:", response);
          if (response.success || response.status === "success") {
            messageApi.success("Vendor updated successfully");
            router.push("/dashboard/vendormanagement");
          } else {
            messageApi.error(response.message || "Failed to update vendor");
          }
        },
        onFail: (error: any) => {
          console.error("Vendor update error:", JSON.stringify(error, null, 2));
          if (error?.data?.message) {
            messageApi.error(error.data.message);
          } else if (error?.message) {
            messageApi.error(error.message);
          } else {
            messageApi.error("Failed to update vendor");
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

  const handleCancel = () => {
    router.push("/dashboard/vendormanagement");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white p-0 sm:p-4 md:p-6 lg:p-8 max-w-8xl mx-auto min-h-screen mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
          Edit Vendor
        </h1>
        <div className="flex md:justify-end justify-center gap-2 sm:gap-3 lg:gap-5">
          <CommonButton
            icon={<Save size={16} />}
            label="Save"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            variant="primary"
            className="w-24 sm:w-36"
          />
          <CommonButton
            label="Cancel"
            onClick={handleCancel}
            className="w-24 sm:w-36"
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-2xl border border-[#8BBB33] p-8">
        <div className="space-y-6">
          {/* Select Agent Field */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Select Advisor 
            </label>
            <Select
              placeholder={
                agentLoading ? "Loading Advisors..." : "Select an Advisor"
              }
              value={formData.select_agent || null}
              onChange={(value) => handleInputChange("select_agent", value)}
              size="large"
              style={{ width: "100%" }}
              options={agentUsers}
              loading={agentLoading}
              disabled={agentLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                (option?.value ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>

          {/* Vendor Name Field */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Vendor Name *
            </label>
            <Input
              placeholder="Enter vendor name"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              size="large"
            />
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col">
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

          {/* Email */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Email Id *
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={formData.emailId}
              onChange={(e) => handleInputChange("emailId", e.target.value)}
              size="large"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Password (Leave empty to keep current)
            </label>
            <Input.Password
              placeholder="Enter new password (min. 6 characters)"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              size="large"
            />
          </div>

          {/* Business Info */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Business Name *
            </label>
            <Input
              placeholder="Enter business name"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              size="large"
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Description
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe your business"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>
          {/* <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">Services/Products Offered</label>
            <Input.TextArea
              rows={3}
              placeholder="Describe services/products offered"
              value={formData.servicesOffered}
              onChange={(e) => handleInputChange("servicesOffered", e.target.value)}
            />
          </div> */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Price List & Packages
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Add price list or package details"
              value={formData.priceList}
              onChange={(e) => handleInputChange("priceList", e.target.value)}
            />
          </div>

          {/* Address & Pincode */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Address *
            </label>
            <Input
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              size="large"
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Pincode *
            </label>
            <Input
              placeholder="Enter 6-digit pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
              size="large"
              maxLength={6}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Category *
            </label>
            <Select
              placeholder="Select category"
              value={formData.categoryId || null}
              onChange={(val) => handleInputChange("categoryId", val)}
              options={(categories || []).map((c: any) => ({
                value: c._id || c.id || c.category_id,
                label: c.category_name || c.name || c.category,
              }))}
              showSearch
              optionFilterProp="label"
              size="large"
            />
          </div>
          {formData.categoryId ? (
            <div className="flex flex-col">
              <label className="block font-semibold text-sm mb-1">
                Subcategory
              </label>
              <Select
                placeholder="Select subcategory"
                value={formData.subcategoryId || null}
                onChange={(val) => handleInputChange("subcategoryId", val)}
                options={(
                  categories.find(
                    (c: any) =>
                      (c._id || c.id || c.category_id) === formData.categoryId
                  )?.subcategories || []
                ).map((s: any) => ({
                  value: s.subcategory_id || s.id,
                  label: s.subcategory_name || s.name || s.subcategory,
                }))}
                showSearch
                optionFilterProp="label"
                size="large"
              />
            </div>
          ) : null}

          {/* Aadhar & PAN numbers */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Aadhar Card Number *
            </label>
            <Input
              placeholder="Enter 12-digit Aadhar number"
              value={formData.aadharCard}
              onChange={(e) => handleInputChange("aadharCard", e.target.value)}
              size="large"
              maxLength={12}
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              PAN Card Number *
            </label>
            <Input
              placeholder="Enter PAN (e.g., ABCDE1234F)"
              value={formData.panCard}
              onChange={(e) => handleInputChange("panCard", e.target.value)}
              size="large"
              maxLength={10}
            />
          </div>

          {/* Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block font-semibold text-sm mb-1">
                Upload Aadhaar Document
              </label>
              <UploadDocument
                value={aadhaarUrl}
                onChange={setAadhaarUrl}
                variant="secondary"
              />
            </div>
            <div className="flex flex-col">
              <label className="block font-semibold text-sm mb-1">
                Business Image
              </label>
              <UploadDocument
                value={businessImageUrl}
                onChange={setBusinessImageUrl}
                variant="secondary"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <label className="block font-semibold text-sm">Active</label>
            <Switch
              checked={formData.isActive}
              onChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVendorPage;
