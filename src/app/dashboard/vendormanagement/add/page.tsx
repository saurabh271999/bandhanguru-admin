"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Select } from "antd";
import { Save, ArrowLeft } from "lucide-react";
import UploadDocument from "@/app/components/upladDocument";
import CommonButton from "@/app/components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import useGetQuery from "@/app/hooks/getQuery.hook";
import usePostQuery from "@/app/hooks/postQuery.hook";
import { apiUrls } from "@/app/apis";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface VendorBusinessForm {
  // Auth & Identity
  userName: string;
  emailId: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;

  // Business Information
  businessName: string;
  description: string; // maps to schema.description
  servicesOffered: string;
  priceList: string;
  address: string;
  pincode: string;

  // Category
  categoryId?: string;
  subcategoryId?: string;

  // Document Numbers
  aadharCard: string; // 12-digit
  panCard: string; // PAN format

  // Media & Docs
  businessImage?: string;
  mapLocation?: string; // not in schema; optional

  // Assignment fields
  agentCode: string;

  // Status
  isActive: boolean;
}

const AddVendorBusinessPage: React.FC = () => {
  const router = useRouter();
  const { messageApi } = useUIProvider();
  const { getQuery } = useGetQuery();
  const { postQuery } = usePostQuery();

  const [formData, setFormData] = useState<VendorBusinessForm>({
    userName: "",
    emailId: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    description: "",
    servicesOffered: "",
    priceList: "",
    address: "",
    pincode: "",
    aadharCard: "",
    panCard: "",
    businessImage: "",
    mapLocation: "",
    agentCode: "",
    isActive: true,
  });

  const [aadhaarUrl, setAadhaarUrl] = useState<string>("");
  const [businessImageUrl, setBusinessImageUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [agentOptions, setAgentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);

  // Phone input state
  const [phoneNumberValue, setPhoneNumberValue] = useState<
    string | undefined
  >();

  const subcategoryOptions = useMemo(() => {
    const selected = categories.find(
      (c) =>
        c._id === categoryId ||
        c.id === categoryId ||
        c.category_id === categoryId
    );
    const subs = selected?.subcategories || selected?.sub_categories || [];
    return (subs as any[]).map((s) => ({
      value: s.subcategory_id || s.id,
      label: s.subcategory_name || s.name || s.subcategory,
    }));
  }, [categories, categoryId]);

  useEffect(() => {
    // Load categories for Category/Subcategory selects
    (async () => {
      await getQuery({
        url: apiUrls.getAllCategories,
        onSuccess: (data: any) => {
          let list: any[] = [];
          if (data?.categories) list = data.categories;
          else if (data?.data?.categories) list = data.data.categories;
          else if (Array.isArray(data)) list = data;
          else if (Array.isArray(data?.data)) list = data.data;
          setCategories(list);
        },
        onFail: () => setCategories([]),
      });
    })();
    // Load agents for Employee Code dropdown
    (async () => {
      try {
        setAgentLoading(true);
        await getQuery({
          url: apiUrls.getAllUsersByRole("agent"),
          onSuccess: (data: any) => {
            const users = data?.users || data?.data?.users || [];
            const opts = (users as any[])
              .filter((u) => u?.agentCode)
              .map((u) => ({
                value: u.agentCode,
                label: `${u.userName || u.name || "Unknown"} (${u.agentCode})`,
              }));
            setAgentOptions(opts);
          },
          onFail: () => setAgentOptions([]),
        });
      } finally {
        setAgentLoading(false);
      }
    })();
  }, [getQuery]);

  const handleChange = (
    key: keyof VendorBusinessForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumberValue(value);
    handleChange("mobileNumber", value || "");
  };

  const handleSubmit = async () => {
    // Validate required fields according to schema
    if (!formData.userName.trim())
      return messageApi.error("User Name is required");
    if (!formData.businessName.trim())
      return messageApi.error("Business Name is required");
    if (!formData.address.trim())
      return messageApi.error("Address is required");
    if (!formData.pincode.trim())
      return messageApi.error("Pincode is required");
    if (!/^\d{6}$/.test(formData.pincode.trim()))
      return messageApi.error("Pincode must be a 6-digit number");
    if (!formData.emailId.trim()) return messageApi.error("Email is required");
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(formData.emailId.trim().toLowerCase()))
      return messageApi.error("Please enter a valid email address");
    if (!formData.mobileNumber.trim())
      return messageApi.error("Mobile Number is required");
    if (formData.mobileNumber.trim().replace(/\D+/g, "").length < 10)
      return messageApi.error("Mobile Number must be at least 10 digits");
    if (!formData.password || formData.password.length < 6)
      return messageApi.error("Password must be at least 6 characters");
    if (
      formData.confirmPassword &&
      formData.confirmPassword !== formData.password
    )
      return messageApi.error("Password and Confirm Password do not match");
    if (!formData.aadharCard || !/^\d{12}$/.test(formData.aadharCard))
      return messageApi.error("Aadhar card must be a 12-digit number");
    if (
      !formData.panCard ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard.toUpperCase())
    )
      return messageApi.error(
        "PAN card must be in valid format (e.g., ABCDE1234F)"
      );
    if (!categoryId) return messageApi.error("Category is required");

    setSubmitting(true);
    try {
      // Derive businessImage from uploader
      const businessImage = businessImageUrl || null;

      // Build final payload to POST (matching schema)
      const payload = {
        userName: formData.userName.trim(),
        emailId: formData.emailId.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword || undefined,
        role: "vendor",

        businessName: formData.businessName.trim(),
        servicesOffered: formData.servicesOffered?.trim() || "",
        priceList: formData.priceList?.trim() || "",
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        description: formData.description?.trim() || "",

        categoryId,
        subcategoryId: subcategoryId || undefined,

        aadharCard: formData.aadharCard.trim(),
        panCard: formData.panCard.trim().toUpperCase(),
        businessImage,
        aadhaarDoc: aadhaarUrl ? [aadhaarUrl] : [],

        agentCode: formData.agentCode?.trim() || "",
        isActive: formData.isActive,
      } as any;

      await postQuery({
        url: apiUrls.createVendor,
        postData: payload,
        onSuccess: () => {
          messageApi.success("Vendor created successfully");
          router.push("/dashboard/vendormanagement");
        },
        onFail: (error: any) => {
          const msg =
            error?.response?.data?.message || "Failed to create vendor";
          messageApi.error(msg);
        },
      });
    } catch (e) {
      messageApi.error("Failed to save vendor details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-0 sm:p-4 md:p-6 lg:p-8 max-w-8xl mx-auto min-h-screen mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
          Add Vendor
        </h1>
        <div className="flex md:justify-end justify-center gap-2 sm:gap-3 lg:gap-5">
          <CommonButton
            icon={<Save size={16} />}
            label="Save"
            onClick={handleSubmit}
            loading={submitting}
            type="primary"
            variant="primary"
            className="w-24 sm:w-36"
          />
          <CommonButton
            icon={<ArrowLeft size={16} />}
            label="Back"
            onClick={() => router.push("/dashboard/vendormanagement")}
            className="w-24 sm:w-36"
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-2xl border border-[#8BBB33] p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category & Subcategory */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Category *
            </label>
            <Select
              placeholder="Select category"
              value={categoryId || undefined}
              onChange={(val) => {
                setCategoryId(val);
                setSubcategoryId("");
              }}
              options={categories.map((c) => ({
                value: c._id || c.id || c.category_id,
                label: c.category_name || c.name || c.category,
              }))}
              showSearch
              optionFilterProp="label"
              size="large"
            />
          </div>
          {categoryId && (
            <div className="flex flex-col">
              <label className="block font-semibold text-sm mb-1">
                Subcategory
              </label>
              <Select
                placeholder="Select subcategory"
                value={subcategoryId || undefined}
                onChange={(val) => setSubcategoryId(val)}
                options={subcategoryOptions}
                showSearch
                optionFilterProp="label"
                size="large"
              />
            </div>
          )}
          {/* Business Name & Owner Details */}
          {/* User & Auth */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              User Name *
            </label>
            <Input
              placeholder="Enter user name"
              value={formData.userName}
              onChange={(e) => handleChange("userName", e.target.value)}
              size="large"
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Password *
            </label>
            <Input.Password
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              size="large"
            />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Confirm Password
            </label>
            <Input.Password
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              size="large"
            />
          </div>

          {/* Business Name & Description */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Business Name *
            </label>
            <Input
              placeholder="Enter business name"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              size="large"
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Description
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe your business"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          {/* Employee Code */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Employee Code
            </label>
            <Select
              placeholder="Select employee code"
              value={formData.agentCode || undefined}
              onChange={(val) => handleChange("agentCode", val)}
              options={agentOptions}
              loading={agentLoading}
              showSearch
              optionFilterProp="label"
              size="large"
              allowClear
            />
          </div>

          {/* Services/Products Offered */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Services/Products Offered
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe services/products offered"
              value={formData.servicesOffered}
              onChange={(e) => handleChange("servicesOffered", e.target.value)}
            />
          </div>

          {/* Contact Details */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">Email *</label>
            <Input
              placeholder="Enter email address"
              value={formData.emailId}
              onChange={(e) => handleChange("emailId", e.target.value)}
              size="large"
              type="email"
            />
          </div>
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

          {/* Price List & Packages */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Price List & Packages
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Add price list or package details"
              value={formData.priceList}
              onChange={(e) => handleChange("priceList", e.target.value)}
            />
          </div>

          {/* Address & Pincode */}
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold text-sm mb-1">
              Address *
            </label>
            <Input
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
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
              onChange={(e) => handleChange("pincode", e.target.value)}
              size="large"
              maxLength={6}
            />
          </div>

          {/* Aadhar & PAN numbers */}
          <div className="flex flex-col">
            <label className="block font-semibold text-sm mb-1">
              Aadhar Card Number *
            </label>
            <Input
              placeholder="Enter 12-digit Aadhar number"
              value={formData.aadharCard}
              onChange={(e) => handleChange("aadharCard", e.target.value)}
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
              onChange={(e) => handleChange("panCard", e.target.value)}
              size="large"
              maxLength={10}
            />
          </div>

          {/* Legacy Aadhaar/PAN section removed; using Aadhar Card Number and PAN Card Number inputs above */}

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Actions (bottom) */}
        <div className="mt-10 flex gap-2 sm:gap-3 lg:gap-5 justify-end">
          <CommonButton
            icon={<Save size={16} />}
            label="Save"
            onClick={handleSubmit}
            loading={submitting}
            type="primary"
            variant="primary"
          />
          <CommonButton
            icon={<ArrowLeft size={16} />}
            label="Back"
            onClick={() => router.push("/dashboard/vendormanagement")}
          />
        </div>
      </div>
    </div>
  );
};

export default AddVendorBusinessPage;
