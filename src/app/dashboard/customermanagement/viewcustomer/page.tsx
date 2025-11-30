"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button, Spin } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useGetQuery from "@/app/hooks/getQuery.hook";
import { apiUrls } from "@/app/apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

export default function ViewCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");
  const { getQuery } = useGetQuery();
  const { messageApi } = useUIProvider();

  const [formData, setFormData] = useState({
    userName: "",
    mobileNumber: "",
    emailId: "",
    isActive: false,
    createdAt: "",
    dob: "",
    address: "",
    role: "",
    roleName: "",
    vendorsCount: 0,
    lastLogin: "",
    joiningDate: "",
    businessName: "",
    businessType: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch customer details by ID
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        await getQuery({
          url: `${apiUrls.getUserById}/${customerId}`,
          onSuccess: (data: any) => {
            console.log("Data received for customer:", data);
            const user = data?.user || data?.data || data;
            if (!user) {
              messageApi.error("Customer not found");
              router.push("/dashboard/customermanagement");
              return;
            }

            // Format location coordinates if available
            let locationStr = "N/A";
            if (user.location?.coordinates && Array.isArray(user.location.coordinates)) {
              locationStr = `${user.location.coordinates[1]}, ${user.location.coordinates[0]}`;
            }

            setFormData({
              userName: user.userName || user.fullName || "",
              mobileNumber: user.mobileNumber || "",
              emailId: user.emailId || user.email || "",
              isActive: user.isActive || false,
              createdAt: user.createdAt || "",
              dob: user.dob || "",
              address: user.address || "",
              role: user.role || "",
              roleName: user.assignedRole?.roleName || "",
              vendorsCount: user.vendorsCount || 0,
              lastLogin: user.lastLogin || "",
              joiningDate: user.joiningDate || "",
              businessName: user.businessName || "",
              businessType: user.businessType || "",
              location: locationStr,
            });
          },
          onFail: (error: any) => {
            const msg =
              error?.response?.data?.message || "Failed to load customer data";
            messageApi.error(msg);
            router.push("/dashboard/customermanagement");
          },
        });
      } catch (err) {
        messageApi.error("Failed to load customer data");
        router.push("/dashboard/customermanagement");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, getQuery, messageApi, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const FormContent = (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">View Customer</h1>
          {customerId ? (
            <p className="text-sm text-gray-500 mt-1">Customer ID: {customerId}</p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Customer Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Name
                  </label>
                  <Input value={formData.userName} disabled size="large" />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Mobile Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formData.mobileNumber}
                    onChange={() => {}}
                    disabled
                    inputStyle={{ width: "100%", height: "40px" }}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.emailId}
                    disabled
                    size="large"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Status
                  </label>
                  <Input
                    value={formData.isActive ? "Active" : "Inactive"}
                    disabled
                    size="large"
                    className={
                      formData.isActive
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Date of Birth
                  </label>
                  <Input
                    value={formData.dob ? formatDate(formData.dob) : "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1">
                    Address
                  </label>
                  <Input
                    value={formData.address || "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Role
                  </label>
                  <Input
                    value={formData.roleName || formData.role || "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Vendors Count */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Vendors Count
                  </label>
                  <Input
                    value={formData.vendorsCount?.toString() || "0"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Business Name */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Business Name
                  </label>
                  <Input
                    value={formData.businessName || "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Business Type */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Business Type
                  </label>
                  <Input
                    value={formData.businessType || "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Location Coordinates */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Location (Lat, Long)
                  </label>
                  <Input
                    value={formData.location}
                    disabled
                    size="large"
                  />
                </div>

                {/* Last Login */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Last Login
                  </label>
                  <Input
                    value={formData.lastLogin ? formatDate(formData.lastLogin) : "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Joining Date */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Joining Date
                  </label>
                  <Input
                    value={formData.joiningDate ? formatDate(formData.joiningDate) : "N/A"}
                    disabled
                    size="large"
                  />
                </div>

                {/* Created Date */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Created Date
                  </label>
                  <Input
                    value={formatDate(formData.createdAt)}
                    disabled
                    size="large"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            className="h-12 text-base font-medium"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );

  return FormContent;
}

