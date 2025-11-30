"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Radio, Button, Select, Spin } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ClientManagementRouteGuard } from "@/app/components/PermissionGuard";
import useGetQuery from "@/app/hooks/getQuery.hook";
import { apiUrls } from "@/app/apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const { TextArea } = Input;
const { Option } = Select;

interface RoleOption {
  value: string;
  label: string;
}

export default function ViewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");
  const { getQuery } = useGetQuery();
  const { messageApi } = useUIProvider();

  const [formData, setFormData] = useState({
    fullName: "",
    fathersName: "",
    dob: "",
    gender: "male" as "male" | "female" | "other",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    address: "",
    roleApplyingFor: "district_coordinator",
    state: "",
    district: "",
    commissioneryName: "",
    agentCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [roleTypes, setRoleTypes] = useState<RoleOption[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);

  // Load role types
  useEffect(() => {
    const fetchRoleTypes = async () => {
      setRoleLoading(true);
      try {
        await getQuery({
          url: apiUrls.getagentTypes,
          onSuccess: (data: any) => {
            let list: any[] = [];
            // Common shapes: { data: [...] } or direct array
            if (Array.isArray(data)) list = data;
            else if (Array.isArray(data?.data)) list = data.data;
            else if (Array.isArray(data?.types)) list = data.types;

            const toLabel = (val: string) =>
              (val || "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (m) => m.toUpperCase());

            const options: RoleOption[] = list
              .map((item: any) => {
                if (typeof item === "string") {
                  return { value: item, label: toLabel(item) };
                }
                const value =
                  item?.value ||
                  item?.id ||
                  item?.type ||
                  item?.name ||
                  item?.roleName ||
                  "";
                const label = item?.label || toLabel(value);
                if (!value) return null;
                return { value, label } as RoleOption;
              })
              .filter(Boolean) as RoleOption[];

            setRoleTypes(options);
          },
          onFail: (error: any) => {
            console.error("Failed to fetch agent role types:", error);
            setRoleTypes([]);
          },
        });
      } catch (error) {
        console.error("Error fetching agent role types:", error);
        setRoleTypes([]);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRoleTypes();
  }, [getQuery]);

  // Fetch client/agent details by ID and prefill
  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      try {
        setLoading(true);
        await getQuery({
          url: `${apiUrls.getUserById}/${clientId}`,
          onSuccess: (data: any) => {
            console.log("Data received for client:", data);
            const user = data?.user || data?.data || data;
            if (!user) {
              messageApi.error("Advisor not found");
              router.push("/dashboard/clientmanagement");
              return;
            }
            // Check for role in multiple possible fields
            const roleValue =
              user.select_agent ||
              user.roleApplyingFor ||
              user.role?.name ||
              user.role?.value ||
              "";

            setFormData({
              fullName: user.fullName || user.userName || "",
              fathersName: user.fathersName || user.guardianName || "",
              dob: user.dob || "",
              gender: (user.gender || "male") as "male" | "female" | "other",
              mobileNumber: user.mobileNumber || "",
              alternateNumber: user.alternateNumber || "",
              email: user.emailId || user.email || "",
              address: user.addressWithPin || user.address || "",
              roleApplyingFor: roleValue,
              state: user.state || "",
              district: user.district || "",
              commissioneryName: user.commissioneryName || "",
              agentCode: user.agentCode || "",
            });
          },
          onFail: (error: any) => {
            const msg =
              error?.response?.data?.message || "Failed to load advisor data";
            messageApi.error(msg);
            router.push("/dashboard/clientmanagement");
          },
        });
      } catch (err) {
        messageApi.error("Failed to load advisor data");
        router.push("/dashboard/clientmanagement");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const FormContent = (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">View Advisor</h1>
          {clientId ? (
            <p className="text-sm text-gray-500 mt-1">Advisor ID: {clientId}</p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Section A – Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Section A – Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Full Name
                  </label>
                  <Input value={formData.fullName} disabled size="large" />
                </div>

                {/* Father's Name */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Father's Name
                  </label>
                  <Input value={formData.fathersName} disabled size="large" />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Date of Birth (DD/MM/YYYY)
                  </label>
                  <Input value={formData.dob} disabled size="large" />
                </div>

                {/* Gender */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Gender
                  </label>
                  <Radio.Group value={formData.gender} disabled>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="other">Other</Radio>
                  </Radio.Group>
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

                {/* Alternate Number */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Alternate Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formData.alternateNumber}
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
                    value={formData.email}
                    disabled
                    size="large"
                  />
                </div>

                {/* Address with PIN Code */}
                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1">
                    Address with PIN Code
                  </label>
                  <TextArea value={formData.address} disabled rows={3} />
                </div>
              </div>
            </div>

            {/* Section B – Role & Work Area */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Section B – Role & Work Area
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Applying For */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Role Applying For
                  </label>
                  <Input
                    size="large"
                    value={
                      roleLoading
                        ? "Loading..."
                        : roleTypes.find(
                            (role) => role.value === formData.roleApplyingFor
                          )?.label ||
                          formData.roleApplyingFor ||
                          "Not specified"
                    }
                    disabled
                  />
                </div>

                {/* State */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    State
                  </label>
                  <Input value={formData.state} disabled size="large" />
                </div>

                {/* District */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    District
                  </label>
                  <Input value={formData.district} disabled size="large" />
                </div>

                {/* Commissionery Name */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Commissionery Name
                  </label>
                  <Input
                    value={formData.commissioneryName}
                    disabled
                    size="large"
                  />
                </div>

                {/* Employee Code */}
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1">
                    Advisor Code
                  </label>
                  <Input
                    value={formData.agentCode}
                    disabled
                    size="large"
                    placeholder="No advisor code assigned"
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

  return <ClientManagementRouteGuard>{FormContent}</ClientManagementRouteGuard>;
}
