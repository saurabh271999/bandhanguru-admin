"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save } from "lucide-react";
import { Button, Input, Select, Spin, Form, DatePicker } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useGetQuery from "../../../../hooks/getQuery.hook";
import usePutQuery from "../../../../hooks/putQuery.hook";
import { apiUrls } from "../../../../apis";
import { MODULES } from "../../../../utils/permissions";
import PermissionGuard from "../../../../components/PermissionGuard";
import CommonButton from "../../../../components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import dayjs from "dayjs";

const { Option } = Select;

interface RoleOption {
  value: string;
  label: string;
}

type LocationOption = RoleOption;

interface FormData {
  fullName: string;
  fathersName: string;
  dob: string;
  gender: "male" | "female" | "other";
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  address: string;
  // roleApplyingFor: string;
  state: string;
  // district: string;
  // commissioneryName: string;
  agentCode: string;
  password?: string;
}

// Helper function to format dates for HTML date input
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";

  try {
    // Handle different date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    // Return in YYYY-MM-DD format for HTML date input
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

function EditUserContent() {
  const { messageApi } = useUIProvider();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { getQuery } = useGetQuery();
  const { putQuery } = usePutQuery();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roleTypes, setRoleTypes] = useState<RoleOption[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);

  // Location states
  const [locationData, setLocationData] = useState<any[]>([]);
  const [stateOptions, setStateOptions] = useState<LocationOption[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<LocationOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    fathersName: "",
    dob: "",
    gender: "male",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    address: "",
    // roleApplyingFor: "",
    state: "",
    // district: "",
    // commissioneryName: "",
    agentCode: "",
    password: "",
  });

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

  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      setStatesLoading(true);
      try {
        await getQuery({
          url: apiUrls.getStates,
          onSuccess: (data: any) => {
            console.log("Raw location API response:", data);

            let locationArray: any[] = [];
            if (data?.data && Array.isArray(data.data)) {
              const flatData = data.data;
              console.log("Flat data received:", flatData);

              const stateMap = new Map();
              flatData.forEach((item: any) => {
                if (!stateMap.has(item.state)) {
                  stateMap.set(item.state, {
                    state: item.state,
                    divisions: [],
                  });
                }
                stateMap.get(item.state).divisions.push({
                  division: item.division,
                  districts: item.districts,
                });
              });

              locationArray = Array.from(stateMap.values());
            } else if (Array.isArray(data)) {
              locationArray = data;
            } else {
              console.warn("Unexpected API response format:", data);
              return;
            }

            console.log("Reconstructed location data:", locationArray);
            setLocationData(locationArray);

            // Extract unique states
            const stateSet = new Set<string>();
            locationArray.forEach((item: any) => {
              if (item?.state) {
                stateSet.add(item.state);
              }
            });

            const stateOptions: LocationOption[] = Array.from(stateSet).map(
              (state) => ({
                value: state,
                label: state,
              })
            );

            console.log("State options set:", stateOptions);
            setStateOptions(stateOptions);
          },
          onFail: (error: any) => {
            console.error("Failed to fetch locations:", error);
            setStateOptions([]);
          },
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
        setStateOptions([]);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchLocationData();
  }, [getQuery]);

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const userResult = await getQuery({
          url: `${apiUrls.getUserById}/${userId}`,
          onSuccess: (response: any) => {
            console.log("User data response:", response);
            if (response.success || response.status === "success") {
              const userData = response.user || response.data;

              // Check for role in multiple possible fields
              const roleValue =
                userData.select_agent ||
                userData.roleApplyingFor ||
                userData.role?.name ||
                userData.role?.value ||
                "";

              const newFormData = {
                fullName: userData.userName || "",
                fathersName:
                  userData.fathersName || userData.guardianName || "",
                dob: formatDateForInput(userData.dob || ""), // Use the formatter here
                gender: userData.gender || "male",
                mobileNumber: userData.mobileNumber || "",
                alternateNumber: userData.alternateNumber || "",
                email: userData.emailId || "",
                address: userData.address || "",
                roleApplyingFor: roleValue,
                state: userData.state || "",
                district: userData.district || "",
                commissioneryName: userData.commissioneryName || "",
                agentCode: userData.agentCode || "",
              };

              setFormData(newFormData);

              // Set form values with a slight delay to ensure form is ready
              setTimeout(() => {
                form.setFieldsValue({
                  ...newFormData,
                  roleApplyingFor: roleValue,
                });
                console.log("Form values set:", {
                  ...newFormData,
                  roleApplyingFor: roleValue,
                });

                // Initialize location options if state is already set
                if (userData.state && locationData.length > 0) {
                  const selectedStateData = locationData.find(
                    (item) => item.state === userData.state
                  );
                  if (selectedStateData && selectedStateData.divisions) {
                    const divisionOptions: LocationOption[] =
                      selectedStateData.divisions.map((div: any) => ({
                        value: div.division,
                        label: div.division,
                      }));
                    setDivisionOptions(divisionOptions);

                    const allDistricts = selectedStateData.divisions.flatMap(
                      (div: any) =>
                        Array.isArray(div.districts) ? div.districts : []
                    );
                    const districtOptions: LocationOption[] = allDistricts.map(
                      (district: string) => ({
                        value: district,
                        label: district,
                      })
                    );
                    setDistrictOptions(districtOptions);
                  }
                }
              }, 100);
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
  }, [userId, form, locationData]);

  const handleCancel = () => {
    router.push("/dashboard/clientmanagement");
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called");
    try {
      // Validate form fields
      console.log("Validating form fields...");
      await form.validateFields();
      console.log("Form validation passed");

      setLoading(true);
      const updateData: any = {
        userName: formData.fullName,
        emailId: formData.email,
        mobileNumber: formData.mobileNumber,
        fathersName: formData.fathersName,
        dob: formData.dob,
        gender: formData.gender,
        alternateNumber: formData.alternateNumber,
        address: formData.address,
        // select_agent: formData.roleApplyingFor,
        state: formData.state,
        // district: formData.district,
        // commissioneryName: formData.commissioneryName,
        // agentCode: formData.agentCode,
        role: "agent", // Ensure role remains agent for clients
        locationData: {
          state: formData.state || undefined,
          // division: formData.commissioneryName || undefined,
          // district: formData.district || undefined,
        },
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log(
        "Updating user with data:",
        JSON.stringify(updateData, null, 2)
      );
      console.log("Current formData:", formData);
      console.log("Current form values:", form.getFieldsValue());

      const result = await putQuery({
        url: `${apiUrls.updateUser}/${userId}`,
        putData: updateData,
        onSuccess: (response: any) => {
          console.log("User update success response:", response);
          if (response.success || response.status === "success") {
            messageApi.success("User updated successfully");
            router.push("/dashboard/clientmanagement");
          } else {
            messageApi.error(response.message || "Failed to update user");
          }
        },
        onFail: (error: any) => {
          console.error("User update error:", JSON.stringify(error, null, 2));
          if (error?.data?.message) {
            messageApi.error(error.data.message);
          } else if (error?.message) {
            messageApi.error(error.message);
          } else {
            messageApi.error("Failed to update user");
          }
        },
      });
    } catch (error: any) {
      console.error("Validation or submit error:", error);
      if (error?.errorFields) {
        // Form validation errors
        messageApi.error("Please fill in all required fields correctly");
      } else {
        messageApi.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle state selection
  const handleStateChange = (stateName: string) => {
    console.log("State selected:", stateName);
    setFormData((prev) => ({ ...prev, state: stateName }));
    form.setFieldsValue({ state: stateName });

    // Clear dependent fields
    setFormData((prev) => ({ ...prev, commissioneryName: "", district: "" }));
    form.setFieldsValue({ commissioneryName: "", district: "" });

    // Find the selected state data
    const selectedStateData = locationData.find(
      (item) => item.state === stateName
    );
    console.log("Selected state data:", selectedStateData);

    if (selectedStateData && selectedStateData.divisions) {
      // Set divisions for this state
      const divisionOptions: LocationOption[] = selectedStateData.divisions.map(
        (div: any) => ({
          value: div.division,
          label: div.division,
        })
      );
      console.log("Division options:", divisionOptions);
      setDivisionOptions(divisionOptions);

      // Set all districts for this state
      const allDistricts = selectedStateData.divisions.flatMap((div: any) =>
        Array.isArray(div.districts) ? div.districts : []
      );
      const districtOptions: LocationOption[] = allDistricts.map(
        (district: string) => ({
          value: district,
          label: district,
        })
      );
      console.log("All district options for state:", districtOptions);
      setDistrictOptions(districtOptions);
    } else {
      console.warn("No divisions found for state:", stateName);
      setDivisionOptions([]);
      setDistrictOptions([]);
    }
  };

  // Handle division selection
  const handleDivisionChange = (divisionName: string) => {
    console.log("Division selected:", divisionName);
    setFormData((prev) => ({ ...prev, commissioneryName: divisionName }));
    form.setFieldsValue({ commissioneryName: divisionName });
    setFormData((prev) => ({ ...prev, district: "" }));
    form.setFieldsValue({ district: "" });

    // Find the selected division data
    const selectedStateData = locationData.find(
      (item) => item.state === formData.state
    );
    const selectedDivision = selectedStateData?.divisions.find(
      (div: any) => div.division === divisionName
    );
    console.log("Selected division data:", selectedDivision);

    if (selectedDivision && Array.isArray(selectedDivision.districts)) {
      const districtOptions: LocationOption[] = selectedDivision.districts.map(
        (district: string) => ({
          value: district,
          label: district,
        })
      );
      console.log("District options for division:", districtOptions);
      setDistrictOptions(districtOptions);
    } else {
      console.warn("No districts found for division:", divisionName);
      setDistrictOptions([]);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-0 md:mb-8 md:mt-0 mt-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Edit Advisor
          </h1>
        </div>
        {/* Desktop buttons - hidden on mobile */}
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
        <Form
          form={form}
          layout="vertical"
          initialValues={formData}
          onFinish={handleSubmit}
        >
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input
              placeholder="Enter full name"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </Form.Item>

          {/* Father's Name */}
          <Form.Item label="Father's Name" name="fathersName">
            <Input
              placeholder="Enter father's name"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fathersName: e.target.value,
                }))
              }
            />
          </Form.Item>

          {/* Date of Birth - FIXED */}
          <Form.Item
            label="Date of Birth"
            name="dob"
            rules={[{ required: false, message: "Date of birth is required" }]}
          >
            <Input
              type="date"
              placeholder="Enter date of birth"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          </Form.Item>

          {/* Gender */}
          <Form.Item label="Gender" name="gender">
            <Select
              style={{ width: "100%" }}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, gender: value }))
              }
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          {/* Mobile Number */}
          <Form.Item
            label="Mobile Number"
            name="mobileNumber"
            rules={[{ required: true, message: "Mobile number is required" }]}
          >
            <PhoneInput
              country={"in"}
              value={formData.mobileNumber}
              onChange={(phone) => {
                setFormData((prev) => ({ ...prev, mobileNumber: phone }));
                form.setFieldsValue({ mobileNumber: phone });
              }}
            />
          </Form.Item>

          {/* Alternate Number */}
          <Form.Item label="Alternate Number" name="alternateNumber">
            <PhoneInput
              country={"in"}
              value={formData.alternateNumber}
              onChange={(phone) => {
                setFormData((prev) => ({ ...prev, alternateNumber: phone }));
                form.setFieldsValue({ alternateNumber: phone });
              }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input
              type="email"
              placeholder="Enter email address"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </Form.Item>

          {/* Address */}
          <Form.Item label="Address" name="address">
            <Input
              placeholder="Enter address"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </Form.Item>

          {/* Role Applying For */}
          {/* <Form.Item label="Role Applying For" name="roleApplyingFor">
            <Select 
              style={{ width: "100%" }}
              placeholder={roleLoading ? "Loading roles..." : "Select role"}
              loading={roleLoading}
              showSearch
              optionFilterProp="label"
              value={formData.roleApplyingFor || undefined}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, roleApplyingFor: value }));
                form.setFieldValue('roleApplyingFor', value);
              }}
            >
              {roleTypes.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          {/* State */}
          <Form.Item label="State" name="state">
            <Select
              style={{ width: "100%" }}
              placeholder={statesLoading ? "Loading states..." : "Select state"}
              loading={statesLoading}
              showSearch
              optionFilterProp="label"
              onChange={handleStateChange}
            >
              {stateOptions.map((state) => (
                <Option key={state.value} value={state.value}>
                  {state.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* District */}
          {/* <Form.Item label="District" name="district">
            <Select 
              style={{ width: "100%" }}
              placeholder="Select district"
              showSearch
              optionFilterProp="label"
              onChange={(value) => {
                setFormData(prev => ({ ...prev, district: value }));
                form.setFieldsValue({ district: value });
              }}
              disabled={!formData.state || districtOptions.length === 0}
            >
              {districtOptions.map((district) => (
                <Option key={district.value} value={district.value}>
                  {district.label}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          {/* Commissionery Name */}
          {/* <Form.Item label="Commissionery Name" name="commissioneryName">
            <Select
              style={{ width: "100%" }}
              placeholder="Select commissionery"
              showSearch
              optionFilterProp="label"
              onChange={handleDivisionChange}
              disabled={!formData.state || divisionOptions.length === 0}
            >
              {divisionOptions.map((division) => (
                <Option key={division.value} value={division.value}>
                  {division.label}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          {/* Employee Code */}
          {/* <Form.Item label="Advisor Code" name="agentCode">
            <Input
              placeholder="Enter advisor code"
              style={{ height: 40 }}
              className="text-sm sm:text-base"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, agentCode: e.target.value }))
              }
            />
          </Form.Item> */}
        </Form>
      </div>

      {/* Mobile buttons - shown below form on mobile */}
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
      redirectTo="/dashboard/clientmanagement"
      action={undefined}
    >
      <EditUserContent />
    </PermissionGuard>
  );
}
