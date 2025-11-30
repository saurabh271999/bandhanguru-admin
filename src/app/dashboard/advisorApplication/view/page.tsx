"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button, Spin, Card, Image, Radio } from "antd";
import useGetQuery from "@/app/hooks/getQuery.hook";
import { apiUrls } from "@/app/apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const { TextArea } = Input;

export default function ViewAdvisorApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");

  const { getQuery } = useGetQuery();
  const { messageApi } = useUIProvider();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({
    // Personal Information
    fullName: "",
    fathersOrGuardiansName: "",
    dateOfBirth: "",
    gender: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    address: {
      addressLine1: "",
      city: "",
      state: "",
      pincode: "",
    },
    
    // Role Application Details
    roleApplyingFor: "",
    state: "",
    district: "",
    commissioneryName: "",
    
    // Education and Experience
    education: "",
    workExperience: "",
    languagesKnown: "",
    hasTechKnowledge: null,
    
    // Vehicle and Identification
    ownsBike: null,
    bikeRegistrationNumber: "",
    drivingLicenceNumber: "",
    aadhaarNumber: "",
    panNumber: "",
    
    // Bank Account Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    
    // Document Images
    aadharCardImages: [],
    panCardImage: "",
    vehicleRegistrationImage: "",
    personalPhoto: "",
    bankPassbookImage: "",
    educationalCertificateImage: "",
    drivingLicenseImage: "",
    
    // Timestamps
    submittedAt: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) {
        messageApi.error("No application ID provided");
        router.push("/dashboard/advisorApplication");
        return;
      }

      try {
        setLoading(true);
        await getQuery({
          url: apiUrls.getAdvisorFormById(applicationId),
          onSuccess: (data: any) => {
            console.log("Advisor application data:", data);
            // Handle different response structures
            const application = data?.data?.advisorForm || data?.advisorForm || data?.data || data;
            
            if (!application) {
              messageApi.error("Advisor application not found");
              router.push("/dashboard/advisorApplication");
              return;
            }

            setFormData({
              // Personal Information
              fullName: application.fullName || "",
              fathersOrGuardiansName: application.fathersOrGuardiansName || "",
              dateOfBirth: application.dateOfBirth || "",
              gender: application.gender || "",
              mobileNumber: application.mobileNumber || "",
              alternateNumber: application.alternateNumber || "",
              email: application.email || "",
              address: application.address || {
                addressLine1: "",
                city: "",
                state: "",
                pincode: "",
              },
              
              // Role Application Details
              roleApplyingFor: application.roleApplyingFor || "",
              state: application.state || "",
              district: application.district || "",
              commissioneryName: application.commissioneryName || "",
              
              // Education and Experience
              education: application.education || "",
              workExperience: application.workExperience || "",
              languagesKnown: application.languagesKnown || "",
              hasTechKnowledge: application.hasTechKnowledge,
              
              // Vehicle and Identification
              ownsBike: application.ownsBike,
              bikeRegistrationNumber: application.bikeRegistrationNumber || "",
              drivingLicenceNumber: application.drivingLicenceNumber || "",
              aadhaarNumber: application.aadhaarNumber || "",
              panNumber: application.panNumber || "",
              
              // Bank Account Details
              accountHolderName: application.accountHolderName || "",
              bankName: application.bankName || "",
              accountNumber: application.accountNumber || "",
              ifscCode: application.ifscCode || "",
              
              // Document Images - Handle stringified JSON arrays
              aadharCardImages: (() => {
                if (!application.aadharCardImages) return [];
                if (!Array.isArray(application.aadharCardImages)) return [];
                
                // Parse stringified JSON if needed
                return application.aadharCardImages.flatMap((item: any) => {
                  if (typeof item === 'string') {
                    try {
                      // Try to parse if it's a JSON string
                      const parsed = JSON.parse(item);
                      return Array.isArray(parsed) ? parsed : [item];
                    } catch {
                      // If parsing fails, return as is
                      return [item];
                    }
                  }
                  return [item];
                }).filter((url: string) => url && url.startsWith('http'));
              })(),
              panCardImage: application.panCardImage || "",
              vehicleRegistrationImage: application.vehicleRegistrationImage || "",
              personalPhoto: application.personalPhoto || "",
              bankPassbookImage: application.bankPassbookImage || "",
              educationalCertificateImage: application.educationalCertificateImage || "",
              drivingLicenseImage: application.drivingLicenseImage || "",
              
              // Timestamps
              submittedAt: application.submittedAt || application.createdAt || "",
              createdAt: application.createdAt || "",
              updatedAt: application.updatedAt || "",
            });
          },
          onFail: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              "Failed to load advisor application data";
            messageApi.error(errorMessage);
            router.push("/dashboard/advisorApplication");
          },
        });
      } catch (error) {
        console.error("Error fetching advisor application:", error);
        messageApi.error("Failed to load advisor application data");
        router.push("/dashboard/advisorApplication");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, getQuery, messageApi, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRoleName = (role: string) => {
    if (!role) return "-";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            View Advisor Application
          </h1>
          {applicationId && (
            <p className="text-sm text-gray-500 mt-1">
              Application ID: {applicationId}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card title="Section A – Personal Information" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Full Name
                  </label>
                  <Input value={formData.fullName || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Father's/Guardian's Name
                  </label>
                  <Input value={formData.fathersOrGuardiansName || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Date of Birth
                  </label>
                  <Input value={formatDate(formData.dateOfBirth)} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Gender
                  </label>
                  <Radio.Group value={formData.gender || "male"} disabled>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="other">Other</Radio>
                  </Radio.Group>
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Mobile Number
                  </label>
                  <Input value={formData.mobileNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Alternate Number
                  </label>
                  <Input value={formData.alternateNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Email Address
                  </label>
                  <Input value={formData.email || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Address Line 1
                  </label>
                  <TextArea 
                    value={formData.address?.addressLine1 || "-"} 
                    disabled 
                    rows={2} 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    City
                  </label>
                  <Input value={formData.address?.city || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    State
                  </label>
                  <Input value={formData.address?.state || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Pincode
                  </label>
                  <Input value={formData.address?.pincode || "-"} disabled size="large" />
                </div>
              </div>
            </Card>

            {/* Role Application Details */}
            <Card title="Section B – Role & Work Area" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Role Applying For
                  </label>
                  <Input 
                    value={formatRoleName(formData.roleApplyingFor)} 
                    disabled 
                    size="large" 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    State
                  </label>
                  <Input value={formData.state || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    District
                  </label>
                  <Input value={formData.district || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Commissionery Name
                  </label>
                  <Input value={formData.commissioneryName || "-"} disabled size="large" />
                </div>
              </div>
            </Card>

            {/* Education and Experience */}
            <Card title="Section C – Education & Experience" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Education
                  </label>
                  <TextArea value={formData.education || "-"} disabled rows={3} />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Work Experience
                  </label>
                  <TextArea value={formData.workExperience || "-"} disabled rows={3} />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Languages Known
                  </label>
                  <Input value={formData.languagesKnown || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Has Technical Knowledge
                  </label>
                  <Input 
                    value={formData.hasTechKnowledge === null ? "-" : formData.hasTechKnowledge ? "Yes" : "No"} 
                    disabled 
                    size="large" 
                  />
                </div>
              </div>
            </Card>

            {/* Vehicle and Identification */}
            <Card title="Section D – Vehicle & Identification" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Owns Bike
                  </label>
                  <Input 
                    value={formData.ownsBike === null ? "-" : formData.ownsBike ? "Yes" : "No"} 
                    disabled 
                    size="large" 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Bike Registration Number
                  </label>
                  <Input value={formData.bikeRegistrationNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Driving Licence Number
                  </label>
                  <Input value={formData.drivingLicenceNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Aadhaar Number
                  </label>
                  <Input value={formData.aadhaarNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    PAN Number
                  </label>
                  <Input value={formData.panNumber || "-"} disabled size="large" />
                </div>
              </div>
            </Card>

            {/* Bank Account Details */}
            <Card title="Section E – Bank Account Details" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Account Holder Name
                  </label>
                  <Input value={formData.accountHolderName || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Bank Name
                  </label>
                  <Input value={formData.bankName || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Account Number
                  </label>
                  <Input value={formData.accountNumber || "-"} disabled size="large" />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    IFSC Code
                  </label>
                  <Input value={formData.ifscCode || "-"} disabled size="large" />
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card title="Section F – Documents" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Photo */}
                {formData.personalPhoto && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Personal Photo
                    </label>
                    <Image
                      src={formData.personalPhoto}
                      alt="Personal Photo"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+PoCBgRCgKRGhIRUiMpARFhIRkhKRIMZISEhESEhEREhEQERERERERERERERERERERERERERERERERERERERERERERERERERER0Z2Z3kN11Z6+r9v1v/8f3r8DGOqAACQQgASiOOBmIxCIJYBACiEEIAEBAFAgBBEBKIBBCAIIA=="
                    />
                  </div>
                )}

                {/* Aadhaar Card Images */}
                {Array.isArray(formData.aadharCardImages) && formData.aadharCardImages.length > 0 && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Aadhaar Card Images
                    </label>
                    <Image.PreviewGroup>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.aadharCardImages.map((url: string, idx: number) => (
                          <Image
                            key={idx}
                            src={url}
                            alt={`Aadhaar ${idx + 1}`}
                            width="100%"
                            height={100}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                          />
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  </div>
                )}

                {/* PAN Card Image */}
                {formData.panCardImage && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      PAN Card
                    </label>
                    <Image
                      src={formData.panCardImage}
                      alt="PAN Card"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}

                {/* Driving License */}
                {formData.drivingLicenseImage && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Driving License
                    </label>
                    <Image
                      src={formData.drivingLicenseImage}
                      alt="Driving License"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}

                {/* Vehicle Registration */}
                {formData.vehicleRegistrationImage && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Vehicle Registration
                    </label>
                    <Image
                      src={formData.vehicleRegistrationImage}
                      alt="Vehicle Registration"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}

                {/* Bank Passbook */}
                {formData.bankPassbookImage && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Bank Passbook
                    </label>
                    <Image
                      src={formData.bankPassbookImage}
                      alt="Bank Passbook"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}

                {/* Educational Certificate */}
                {formData.educationalCertificateImage && (
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">
                      Educational Certificate
                    </label>
                    <Image
                      src={formData.educationalCertificateImage}
                      alt="Educational Certificate"
                      width="100%"
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}
              </div>

              {!formData.personalPhoto && 
               !formData.aadharCardImages?.length && 
               !formData.panCardImage && 
               !formData.drivingLicenseImage && 
               !formData.vehicleRegistrationImage && 
               !formData.bankPassbookImage && 
               !formData.educationalCertificateImage && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                </div>
              )}
            </Card>

            {/* Submission Information */}
            <Card title="Submission Information" className="shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Submitted At
                  </label>
                  <Input 
                    value={formatDateTime(formData.submittedAt)} 
                    disabled 
                    size="large" 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block font-semibold text-sm mb-1 text-gray-700">
                    Last Updated
                  </label>
                  <Input 
                    value={formatDateTime(formData.updatedAt)} 
                    disabled 
                    size="large" 
                  />
                </div>
              </div>
            </Card>
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
}
