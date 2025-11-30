"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, DatePicker, Upload, Button } from "antd";
import dayjs from "dayjs";
// Removed single-file uploader in favor of native multi Upload
import CommonButton from "@/app/components/commonbtn";
import usePostQuery from "@/app/hooks/postQuery.hook";
import usePutQuery from "@/app/hooks/putQuery.hook";
import useGetQuery from "@/app/hooks/getQuery.hook";
import { apiUrls } from "@/app/apis";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import ViewSkeletonLoader from "../ViewSkeletonLoader";

// Define interfaces for type safety
interface InstallerFormData {
  userName: string;
  mobileNumber: string;
  emailId: string;
  password: string;
  installerCode: string;
  installerCertificate: string | string[];
  joiningDate?: string;
  role: string;
  projectCode?: string;
}

interface InstallerFormErrors {
  userName?: string;
  mobileNumber?: string;
  emailId?: string;
  password?: string;
  installerCode?: string;
  installerCertificate?: string;
  joiningDate?: string;
  role?: string;
  projectCode?: string;
}

interface InstallerFormProps {
  mode?: "add" | "edit";
  installerId?: string | null;
  initialData?: Partial<InstallerFormData> | null;
  onSuccess?: ((res: any) => void) | null;
}

const InstallerForm: React.FC<InstallerFormProps> = ({
  mode = "add",
  installerId = null,
  initialData = null,
  onSuccess = null,
}) => {
  const { messageApi, modal } = useUIProvider();
  const [formData, setFormData] = useState<InstallerFormData>({
    userName: "",
    mobileNumber: "",
    emailId: "",
    password: "",
    installerCode: "",
    installerCertificate: "",
    joiningDate: "",
    role: "installer",
    projectCode: "",
  });

  // Track uploaded installer certificate URLs as a list
  const [installerCertificateUrls, setInstallerCertificateUrls] = useState<
    string[]
  >([]);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);

  const [errors, setErrors] = useState<InstallerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(mode === "edit");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");

  const { postQuery, loading: postLoading } = usePostQuery();
  const { putQuery, loading: putLoading } = usePutQuery();
  const { getQuery, loading: getLoading } = useGetQuery();
  const router = useRouter();

  // Initialize form data based on mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const normalizedCertificate = Array.isArray(
        initialData.installerCertificate
      )
        ? initialData.installerCertificate
        : initialData.installerCertificate || "";

      setFormData({
        userName: initialData.userName || "",
        mobileNumber: initialData.mobileNumber || "",
        emailId: initialData.emailId || "",
        password: "", // Don't pre-fill password for security
        installerCode: initialData.installerCode || "",
        installerCertificate: normalizedCertificate,
        joiningDate: (initialData as any)?.joiningDate || "",
        role: initialData.role || "installer",
        projectCode: initialData.projectCode || "",
      });
      // Initialize multi-upload state from initial data
      if (Array.isArray(normalizedCertificate)) {
        setInstallerCertificateUrls(normalizedCertificate);
      } else if (
        typeof normalizedCertificate === "string" &&
        normalizedCertificate
      ) {
        setInstallerCertificateUrls([normalizedCertificate]);
      } else {
        setInstallerCertificateUrls([]);
      }
      setIsLoading(false);
    } else if (mode === "edit" && installerId) {
      fetchInstallerData();
    }
  }, [mode, installerId, initialData]);

  // Fetch installer data by ID (for edit mode)
  const fetchInstallerData = () => {
    if (!installerId) {
      messageApi.error("Installer ID is required");
      router.push("/dashboard/installers/manageInstaller");
      return;
    }

    getQuery({
      url: `${apiUrls?.getInstallerById}/${installerId}`,
      onSuccess: (response: any) => {
        const installerData = response?.data || response;
        if (installerData) {
          const normalizedCertificate = Array.isArray(
            installerData.installerCertificate
          )
            ? installerData.installerCertificate
            : installerData.installerCertificate || "";

          setFormData({
            userName: installerData.userName || "",
            mobileNumber: installerData.mobileNumber || "",
            emailId: installerData.emailId || "",
            password: "", // Don't pre-fill password for security
            installerCode:
              installerData.installerCode ||
              installerData.installer_code ||
              installerData.code ||
              "",
            installerCertificate: normalizedCertificate,
            joiningDate: installerData.joiningDate || "",
            role: installerData.role || "installer",
            projectCode: installerData.projectCode || "",
          });
          if (Array.isArray(normalizedCertificate)) {
            setInstallerCertificateUrls(normalizedCertificate);
          } else if (
            typeof normalizedCertificate === "string" &&
            normalizedCertificate
          ) {
            setInstallerCertificateUrls([normalizedCertificate]);
          } else {
            setInstallerCertificateUrls([]);
          }
        }
        setIsLoading(false);
      },
      onFail: (err: any) => {
        messageApi.error("Failed to fetch installer details");
        setIsLoading(false);
      },
    });
  };

  const handleInputChange = (field: keyof InstallerFormData, value: any) => {
    // Allow arrays for installerCertificate; otherwise avoid storing raw objects
    let processedValue = value;
    if (
      field !== "installerCertificate" &&
      typeof value === "object" &&
      value !== null
    ) {
      processedValue =
        value.toString() === "[object Object]" ? "" : String(value);
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: processedValue,
      };
      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleMobileNumberChange = (e: any) => {
    let mobileNumber = "";
    if (typeof e === "string") {
      mobileNumber = e;
    } else if (e?.target?.value !== undefined) {
      mobileNumber = e.target.value;
    } else if (typeof e === "object" && e !== null) {
      mobileNumber = e.value || e.phone || e.number || "";
    }
    handleInputChange("mobileNumber", mobileNumber);
  };

  const handleCountryChange = (countryCode: string, dialCode: string) => {
    setSelectedCountryCode(countryCode);
  };

  // Upload installer certificate(s) - custom uploader to support multiple files
  const handleCertificateUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      setIsUploadingCertificate(true);
      const base64String: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Reuse image upload endpoint
      postQuery({
        url: apiUrls.uploadImage,
        postData: { base64String },
        onSuccess: (res: any) => {
          const fileUrl =
            res?.data || res?.url || res?.fileUrl || res?.file || "";
          if (fileUrl) {
            // Remove any backticks that might be in the URL
            const cleanUrl = fileUrl.replace(/`/g, "");
            setInstallerCertificateUrls((prev) => [...prev, cleanUrl]);
            // Also keep formData in sync (store array if multiple, string if one)
            const next = [...installerCertificateUrls, cleanUrl];
            handleInputChange(
              "installerCertificate",
              next.length > 1 ? next : next[0]
            );
          }
          setIsUploadingCertificate(false);
          onSuccess?.(res);
        },
        onFail: (err: any) => {
          setIsUploadingCertificate(false);
          onError?.(err);
        },
      });
    } catch (err) {
      setIsUploadingCertificate(false);
      onError?.(err);
    }
  };

  const handleCertificateRemove = (urlToRemove: string) => {
    setInstallerCertificateUrls((prev) => {
      const next = prev.filter((u) => u !== urlToRemove);
      // Sync with form data as string or array
      if (next.length === 0) {
        handleInputChange("installerCertificate", "");
      } else if (next.length === 1) {
        handleInputChange("installerCertificate", next[0]);
      } else {
        handleInputChange("installerCertificate", next);
      }
      return next;
    });
  };

  const handleSubmitClick = () => {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(syntheticEvent);
  };

  const validateForm = (): InstallerFormErrors => {
    const newErrors: InstallerFormErrors = {};

    // User Name validation
    if (!formData.userName.trim()) {
      newErrors.userName = "User Name is required";
    }

    // Email validation
    if (!formData.emailId.trim()) {
      newErrors.emailId = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = "Please enter a valid email address";
    }

    // Mobile Number validation
    if (!formData.mobileNumber || !String(formData.mobileNumber).trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    }

    // Installer Code validation
    if (!formData.installerCode || !formData.installerCode.trim()) {
      newErrors.installerCode = "Installer Code is required";
    } else if (formData.installerCode.trim().length < 2) {
      newErrors.installerCode =
        "Installer Code must be at least 2 characters long";
    }

    // Password validation (required for add mode, optional for edit)
    if (mode === "add" && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Role validation
    if (!formData.role || !formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submission
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      // Show specific error message for the first error
      const firstError = Object.values(formErrors)[0];
      messageApi.error(
        firstError || "Please fill the form correctly before submitting"
      );
      return;
    }

    setIsSubmitting(true);

    const sanitizedMobile = String(formData.mobileNumber || "").replace(
      /\D/g,
      ""
    );
    // Normalize to 10 digits if backend expects domestic number
    const normalizedMobile10 =
      sanitizedMobile.length > 10
        ? sanitizedMobile.slice(-10)
        : sanitizedMobile;
    const trimmedName = (formData.userName || "").trim();
    const trimmedEmail = (formData.emailId || "").trim();
    const trimmedInstallerCode = (formData.installerCode || "").trim();
    const certificatesValue = Array.isArray(installerCertificateUrls)
      ? installerCertificateUrls.length > 1
        ? installerCertificateUrls
        : installerCertificateUrls[0] || ""
      : typeof formData.installerCertificate === "string"
      ? formData.installerCertificate
      : "";

    // Ensure all required fields are present with proper values
    const submitData: any = {
      installerCode: trimmedInstallerCode || "",
      userName: trimmedName || "", // Changed from installerName to userName to match backend
      joiningDate: formData.joiningDate || "",
      mobileNumber: normalizedMobile10 || "",
      emailId: trimmedEmail || "",
      password: formData.password || "",
      installerCertificate: certificatesValue || "",
      role: formData.role || "installer", // Add role field
      projectCode: formData.projectCode || "", // Add projectCode field
    };

    console.log("Installer submit payload:", submitData, {
      types: Object.fromEntries(
        Object.entries(submitData).map(([k, v]) => [
          k,
          Array.isArray(v) ? "array" : typeof v,
        ])
      ),
    });
    console.log("Certificates URLs:", installerCertificateUrls);
    console.log("POST URL:", apiUrls?.createInstaller);

    // Password is already included in submitData, no need to add it again

    if (mode === "add") {
      // Add new installer
      postQuery({
        url: apiUrls?.createInstaller,
        postData: submitData,
        onSuccess: (res: any) => {
          const installerName = formData.userName || "Installer";

          if (onSuccess) {
            onSuccess(res);
          } else {
            modal.success({
              title: "Installer Added Successfully",
              content: `${installerName} has been added to the system.`,
              okText: "OK",
              onOk: () => router.push("/dashboard/installers/manageInstaller"),
            });
          }

          // Reset form after successful submission
          setFormData({
            userName: "",
            mobileNumber: "",
            emailId: "",
            password: "",
            installerCode: "",
            installerCertificate: "",
            joiningDate: "",
            role: "installer",
            projectCode: "",
          });
          setInstallerCertificateUrls([]);
          setErrors({});
          setIsSubmitting(false);
        },
        onFail: (err: any) => {
          console.error("Add installer failed:", err?.response?.data || err);
          const backendData = err?.response?.data;
          const detail = backendData
            ? backendData.message || JSON.stringify(backendData)
            : err?.message;
          messageApi.error(
            detail || "Failed to add installer. Please try again."
          );
          setIsSubmitting(false);
        },
      });
    } else {
      const updateUrl = `${apiUrls?.updateInstaller}/${installerId}`;
      putQuery({
        url: updateUrl,
        putData: submitData,
        onSuccess: (res: any) => {
          const installerName = formData.userName || "Installer";
          if (onSuccess) {
            onSuccess(res);
          } else {
            modal.success({
              title: "Installer Updated Successfully",
              content: `${installerName} has been updated successfully.`,
              okText: "OK",
              onOk: () => router.push("/dashboard/installers/manageInstaller"),
            });
          }
          setIsSubmitting(false);
        },
        onFail: (err: any) => {
          putQuery({
            url: `${apiUrls?.updateInstaller}/${installerId}`,
            putData: submitData,
            onSuccess: (res: any) => {
              const installerName = formData.userName || "Installer";
              if (onSuccess) {
                onSuccess(res);
              } else {
                modal.success({
                  title: "Installer Updated Successfully",
                  content: `${installerName} has been updated successfully.`,
                  okText: "OK",
                  onOk: () =>
                    router.push("/dashboard/installers/manageInstaller"),
                });
              }
              setIsSubmitting(false);
            },
            onFail: (fallbackErr: any) => {
              messageApi.error(
                fallbackErr?.response?.data?.message ||
                  "Failed to update installer. Please try again."
              );
              setIsSubmitting(false);
            },
          });
        },
      });
    }
  };

  if (isLoading) {
    return <ViewSkeletonLoader />;
  }

  return (
    <div className="p-0 md:p-2 bg-white rounded-lg">
      <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-6">
        {mode === "add" ? "Add New Installer" : "Edit Installer"}
      </h1>
      <div className="bg-white text-black w-full shadow-md rounded-lg p-2 md:p-6 border-2 border-[#E2F2C3] flex flex-col gap-y-4">
        <div>
          <label className="block font-semibold text-sm mb-1">Name *</label>
          <Input
            placeholder="Enter installer's full name"
            value={formData.userName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("userName", e.target.value)
            }
            size="large"
            status={errors.userName ? "error" : ""}
          />
          {errors.userName && (
            <div className="text-red-500 text-sm mt-1">{errors.userName}</div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-sm mb-1">Email Id *</label>
          <Input
            type="email"
            placeholder="john.doe@example.com"
            value={formData.emailId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("emailId", e.target.value)
            }
            size="large"
            status={errors.emailId ? "error" : ""}
          />
          {errors.emailId && (
            <div className="text-red-500 text-sm mt-1">{errors.emailId}</div>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <div>
            <label className="block font-semibold text-sm mb-1">
              Mobile Number *
            </label>
            <PhoneInput
              country={"in"}
              value={String(formData.mobileNumber || "")}
              onChange={handleMobileNumberChange}
              inputStyle={{ width: "100%", height: "40px" }}
            />
          </div>
          {errors.mobileNumber && (
            <div className="text-red-500 text-sm mt-1">
              {errors.mobileNumber}
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-semibold text-sm mb-1">
            {mode === "add"
              ? "Password *"
              : "Password (leave blank to keep current)"}
          </label>
          <Input.Password
            placeholder={
              mode === "add"
                ? "Enter a strong password (min. 6 characters)"
                : "Enter new password (optional)"
            }
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("password", e.target.value)
            }
            size="large"
            status={errors.password ? "error" : ""}
          />
          {errors.password && (
            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
          )}
        </div>

        {/* Installer Code */}
        <div>
          <label className="block font-semibold text-sm mb-1">
            Installer Code *
          </label>
          <Input
            placeholder="Enter installer code"
            value={formData.installerCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("installerCode", e.target.value)
            }
            size="large"
            status={errors.installerCode ? "error" : ""}
            maxLength={50}
          />
          {errors.installerCode && (
            <div className="text-red-500 text-sm mt-1">
              {errors.installerCode}
            </div>
          )}
        </div>

        {/* Role - Hidden field since this is an installer form */}
        <div style={{ display: "none" }}>
          <Input
            value={formData.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("role", e.target.value)
            }
          />
        </div>

        {/* Date of Joining */}
        <div>
          <label className="block font-semibold text-sm mb-1">
            Date of Joining
          </label>
          <DatePicker
            style={{ width: "100%" }}
            size="large"
            value={
              formData.joiningDate ? dayjs(formData.joiningDate) : undefined
            }
            onChange={(date) =>
              handleInputChange(
                "joiningDate",
                date ? date.toDate().toISOString() : ""
              )
            }
            format="YYYY-MM-DD"
          />
        </div>

        {/* Upload Installer Certificate(s) */}
        <div>
          <label className="block font-semibold text-sm mb-1">
            Installer Certificate(s)
          </label>
          <Upload
            multiple
            accept="image/*,.pdf,.doc,.docx"
            listType="text"
            fileList={(installerCertificateUrls || []).map((url, idx) => ({
              uid: `${idx}`,
              name: `certificate-${idx + 1}`,
              status: "done",
              url,
            }))}
            onRemove={(file) => {
              if (file.url) {
                handleCertificateRemove(file.url);
              }
              return true;
            }}
            customRequest={handleCertificateUpload}
            showUploadList={{ showDownloadIcon: true }}
          >
            <Button
              loading={isUploadingCertificate}
              disabled={isUploadingCertificate}
            >
              {isUploadingCertificate ? "Uploading..." : "Upload Certificate"}
            </Button>
          </Upload>
          {/* Certificate is optional; no inline error */}
          {/* {Array.isArray(installerCertificateUrls) &&
            installerCertificateUrls.length > 0 && (
              <div className="mt-2 space-y-1">
                {installerCertificateUrls.map((url, i) => (
                  <p key={url} className="text-xs text-gray-500 break-all">
                    {`#${i + 1}`} URL:{" "}
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      {url}
                    </a>
                  </p>
                ))}
              </div>
            )} */}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-row space-x-3 sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <CommonButton
            label="Cancel"
            onClick={() => router.push("/dashboard/installers/manageInstaller")}
          />
          <CommonButton
            label={
              isSubmitting || postLoading || putLoading
                ? mode === "add"
                  ? "Adding Installer"
                  : "Updating Installer"
                : mode === "add"
                ? "Submit"
                : "Update Installer"
            }
            onClick={handleSubmitClick}
            loading={isSubmitting || postLoading || putLoading}
            type="primary"
            style={{ backgroundColor: "#274699" }}
          />
        </div>
      </div>
    </div>
  );
};

export default InstallerForm;
