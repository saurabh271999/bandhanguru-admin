"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button, Spin, Image, Carousel, Alert } from "antd";
import { VendorManagementRouteGuard } from "@/app/components/PermissionGuard";
import useGetQuery from "@/app/hooks/getQuery.hook";
import { apiUrls } from "@/app/apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

export default function ViewVendorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("id");

  const { getQuery } = useGetQuery();
  const { messageApi } = useUIProvider();

  const [loading, setLoading] = useState(true);
  const [videoErrors, setVideoErrors] = useState<{ [key: number]: string }>({});
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>(
    {}
  );

  const [formData, setFormData] = useState({
    // Identity
    userName: "",
    emailId: "",
    mobileNumber: "",
    select_agent: "", // agentCode
    role: "vendor",
    isActive: true as boolean,

    // Business
    businessName: "",
    description: "",
    servicesOffered: "",
    priceList: "",
    address: "",
    pincode: "",
    category: "",
    subcategory: "",

    // Docs & media
    aadharCard: "",
    panCard: "",
    businessImage: [] as string[],
    aadhaarDoc: [] as string[],
    businessVideos: [] as string[],

    // Subscription
    subscription: null as any,
  });

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Video event handlers
  const handleVideoLoadStart = (index: number) => {
    setVideoLoading((prev) => ({ ...prev, [index]: true }));
    setVideoErrors((prev) => ({ ...prev, [index]: "" }));
  };

  const handleVideoCanPlay = (index: number) => {
    setVideoLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleVideoError = (index: number, error?: string) => {
    setVideoLoading((prev) => ({ ...prev, [index]: false }));
    setVideoErrors((prev) => ({
      ...prev,
      [index]:
        error || "Failed to load video. Please check the video URL or format.",
    }));
  };

  // Render individual video
  const renderVideo = (url: string, index: number, title: string) => {
    if (isYouTubeUrl(url)) {
      return (
        <div
          className="relative w-full"
          style={{ paddingBottom: "56.25%", height: 0 }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={getYouTubeEmbedUrl(url)}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ minHeight: "300px" }}
          />
        </div>
      );
    }

    return (
      <div className="relative">
        {videoLoading[index] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
            <Spin size="large" />
          </div>
        )}
        <video
          width="100%"
          height="300"
          style={{
            objectFit: "cover",
            borderRadius: 8,
            maxHeight: "300px",
          }}
          controls
          preload="metadata"
          onLoadStart={() => handleVideoLoadStart(index)}
          onCanPlay={() => handleVideoCanPlay(index)}
          onError={() => handleVideoError(index)}
          onLoadedData={() => handleVideoCanPlay(index)}
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          <source src={url} type="video/ogg" />
          <source src={url} type="video/mov" />
          <source src={url} type="video/avi" />
          Your browser does not support the video tag.
        </video>
        {videoErrors[index] && (
          <Alert
            message="Video Error"
            description={videoErrors[index]}
            type="error"
            className="mt-2"
            closable
            onClose={() => setVideoErrors((prev) => ({ ...prev, [index]: "" }))}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId) return;
      try {
        setLoading(true);
        await getQuery({
          url: apiUrls.getVendorById(vendorId as string),
          onSuccess: (data: { vendor?: any; data?: any }) => {
            const vendor = data?.vendor || data?.data || data;
            if (!vendor) {
              messageApi.error("Vendor not found");
              router.push("/dashboard/vendormanagement");
              return;
            }

            setFormData({
              userName: vendor.userName || vendor.name || "",
              emailId: vendor.emailId || vendor.email || "",
              mobileNumber: vendor.mobileNumber || "",
              select_agent:
                vendor.agentCode ||
                vendor.assignedAgent ||
                vendor.select_agent ||
                "",
              role: vendor.role || vendor.assignedRole?.roleName || "vendor",
              isActive: vendor.isActive !== undefined ? vendor.isActive : true,

              businessName: vendor.businessName || "",
              description: vendor.description || "",
              servicesOffered: vendor.servicesOffered || "",
              priceList: vendor.priceList || "",
              address: vendor.address || "",
              pincode: vendor.pincode || "",
              category:
                vendor.categoryId?.category_name ||
                vendor.categoryId?.name ||
                vendor.category ||
                "",
              subcategory: vendor.subcategoryName || vendor.subcategory || "",

              aadharCard: vendor.aadharCard || vendor.aadhaarNumber || "",
              panCard: vendor.panCard || vendor.panNumber || "",

              businessImage: Array.isArray(vendor.businessImage)
                ? vendor.businessImage
                : vendor.businessImage
                ? [vendor.businessImage]
                : [],

              aadhaarDoc: Array.isArray(vendor.aadhaarDoc)
                ? vendor.aadhaarDoc
                : vendor.aadhaarDoc
                ? [vendor.aadhaarDoc]
                : [],

              businessVideos: Array.isArray(vendor.businessVideos)
                ? vendor.businessVideos
                : vendor.businessVideos
                ? [vendor.businessVideos]
                : [],

              subscription: vendor.currentSubscription || null,
            });
          },
          onFail: (error: { response?: { data?: { message?: string } } }) => {
            const errorMessage =
              error?.response?.data?.message || "Failed to load vendor data";
            messageApi.error(errorMessage);
            router.push("/dashboard/vendormanagement");
          },
        });
      } catch {
        messageApi.error("Failed to load vendor data");
        router.push("/dashboard/vendormanagement");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId, getQuery, messageApi, router]);

  return (
    <VendorManagementRouteGuard>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              View Vendor
            </h1>
            {vendorId ? (
              <p className="text-sm text-gray-500 mt-1">
                Vendor ID: {vendorId}
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Vendor Name */}
              <div className="flex flex-col md:col-span-2">
                <label className="block font-semibold text-sm mb-1">
                  Vendor Name
                </label>
                <Input value={formData.userName} disabled size="large" />
              </div>

              {/* Email Id */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Email Id
                </label>
                <Input value={formData.emailId} disabled size="large" />
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Mobile Number
                </label>
                <Input value={formData.mobileNumber} disabled size="large" />
              </div>

              {/* Assigned Advisor */}
              <div className="flex flex-col md:col-span-2">
                <label className="block font-semibold text-sm mb-1">
                  Assigned Advisor
                </label>
                <Input value={formData.select_agent} disabled size="large" />
                <span className="text-xs text-gray-500 mt-1">
                  (Shows Advisor ID or name if available)
                </span>
              </div>

              {/* Role */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">Role</label>
                <Input value={formData.role} disabled size="large" />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Active Status
                </label>
                <Input
                  value={formData.isActive ? "Active" : "Inactive"}
                  disabled
                  size="large"
                />
              </div>

              {/* Business Details */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Business Name
                    </label>
                    <Input value={formData.businessName || "-"} disabled />
                  </div>
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Services/Products Offered
                    </label>
                    <Input.TextArea
                      rows={3}
                      value={formData.servicesOffered || "-"}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="block font-semibold text-sm mb-1">
                      Description
                    </label>
                    <Input.TextArea
                      rows={3}
                      value={formData.description || "-"}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="block font-semibold text-sm mb-1">
                      Price List & Packages
                    </label>
                    <Input.TextArea
                      rows={3}
                      value={formData.priceList || "-"}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Address
                    </label>
                    <Input value={formData.address || "-"} disabled />
                  </div>
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Pincode
                    </label>
                    <Input value={formData.pincode || "-"} disabled />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Category
                    </label>
                    <Input value={formData.category || "-"} disabled />
                  </div>
                  <div className="flex flex-col">
                    <label className="block font-semibold text-sm mb-1">
                      Subcategory
                    </label>
                    <Input value={formData.subcategory || "-"} disabled />
                  </div>
                </div>
              </div>

              {/* Subscription Plan Details */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Subscription Plan
                </h3>
                {!formData.subscription ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <p className="text-gray-500 text-base font-medium">No Plan</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This vendor does not have an active subscription plan.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                    {(() => {
                      // Use currentSubscription directly (it's already the active one)
                      const activeSubscription = formData.subscription;

                      if (!activeSubscription) {
                        return (
                          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-base font-medium">
                              No Plan
                            </p>
                          </div>
                        );
                      }

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

                      const calculateDaysRemaining = (endDate: string) => {
                        if (!endDate) return null;
                        try {
                          const end = new Date(endDate);
                          const today = new Date();
                          const diffTime = end.getTime() - today.getTime();
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                          );
                          return diffDays;
                        } catch {
                          return null;
                        }
                      };

                      const daysRemaining =
                        activeSubscription.daysRemaining !== undefined
                          ? activeSubscription.daysRemaining
                          : calculateDaysRemaining(activeSubscription.endDate);

                      // Hardcode plan status as "active"
                      const planStatus = "active";

                      return (
                        <div className="space-y-4">
                          {/* Plan Header */}
                          <div className="flex items-center justify-between pb-4 border-b border-blue-200">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">
                                {activeSubscription.planName || "No Plan Name"}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {activeSubscription.planType || "-"} • {activeSubscription.duration || "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}
                              >
                                {planStatus}
                              </span>
                              {daysRemaining !== null && (
                                <p
                                  className={`text-sm font-semibold mt-2 ${
                                    daysRemaining > 30
                                      ? "text-green-600"
                                      : daysRemaining > 7
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {daysRemaining < 0
                                    ? "Expired"
                                    : `${daysRemaining} days remaining`}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Plan Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Base Price
                              </label>
                              <p className="text-base font-medium text-gray-900">
                                {activeSubscription.basePrice
                                  ? `₹${activeSubscription.basePrice}`
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                GST Amount
                              </label>
                              <p className="text-base font-medium text-gray-900">
                                {activeSubscription.gstAmount
                                  ? `₹${activeSubscription.gstAmount}`
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Total Price
                              </label>
                              <p className="text-lg font-bold text-blue-600">
                                {activeSubscription.price
                                  ? `₹${activeSubscription.price}`
                                  : activeSubscription.originalPrice
                                  ? `₹${activeSubscription.originalPrice}`
                                  : "-"}
                              </p>
                            </div>
                            {activeSubscription.discountAmount > 0 && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Discount
                                </label>
                                <p className="text-base font-medium text-green-600">
                                  ₹{activeSubscription.discountAmount}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Dates and Payment Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-blue-200">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Start Date
                              </label>
                              <p className="text-sm text-gray-900">
                                {formatDate(
                                  activeSubscription.startDate ||
                                    activeSubscription.activatedAt
                                )}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                End Date
                              </label>
                              <p className="text-sm text-gray-900">
                                {formatDate(activeSubscription.endDate)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Payment Method
                              </label>
                              <p className="text-sm text-gray-900">
                                {activeSubscription.paymentMethod || "-"}
                              </p>
                            </div>
                            {activeSubscription.transactionId && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Transaction ID
                                </label>
                                <p className="text-sm text-gray-900 break-all">
                                  {activeSubscription.transactionId}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Plan Features */}
                          {activeSubscription.features && (
                            <div className="pt-4 border-t border-blue-200">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Plan Features
                              </label>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {activeSubscription.features.listingOnPlatform && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Listing on Platform
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.contactDetailsVisible && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Contact Details Visible
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.photosUpload && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Photos Upload
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.whatsappPromotion && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        WhatsApp Promotion
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.socialMediaPromotion && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Social Media Promotion
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.priorityListing && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Priority Listing
                                      </span>
                                    </div>
                                  )}
                                  {activeSubscription.features.support && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span className="text-sm text-gray-700">
                                        Support:{" "}
                                        <span className="font-semibold">
                                          {activeSubscription.features.support}
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Coupon Code if available */}
                          {activeSubscription.couponCode && (
                            <div className="pt-2 border-t border-blue-200">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Coupon Code
                              </label>
                              <p className="text-sm font-medium text-blue-600">
                                {activeSubscription.couponCode}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Documents & Media */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Documents & Media
                </h3>

                {/* Business Videos Section - Fixed */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold mb-3 text-gray-700">
                    Business Videos
                  </h4>
                  {Array.isArray(formData.businessVideos) &&
                  formData.businessVideos.length > 0 ? (
                    formData.businessVideos.length === 1 ? (
                      // Single video - no carousel needed
                      <div className="max-w-2xl">
                        {renderVideo(
                          formData.businessVideos[0],
                          0,
                          "Business Video"
                        )}
                      </div>
                    ) : (
                      // Multiple videos - use carousel
                      <div className="max-w-2xl">
                        <Carousel
                          autoplay={false}
                          dots={true}
                          arrows={true}
                          className="business-videos-carousel"
                        >
                          {formData.businessVideos.map((url, idx) => (
                            <div key={idx} className="px-2">
                              {renderVideo(
                                url,
                                idx,
                                `Business Video ${idx + 1}`
                              )}
                            </div>
                          ))}
                        </Carousel>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500 text-sm">
                        No business videos available
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Business Images */}
                  <div>
                    <h4 className="text-base font-semibold mb-3 text-gray-700">
                      Business Images
                    </h4>
                    {Array.isArray(formData.businessImage) &&
                    formData.businessImage.length > 0 ? (
                      <Image.PreviewGroup>
                        <Carousel
                          autoplay={false}
                          dots={true}
                          className="business-images-carousel"
                        >
                          {formData.businessImage.map((url, idx) => (
                            <div key={idx}>
                              <Image
                                width="100%"
                                height={300}
                                style={{
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                                src={url}
                                alt={`Business Image ${idx + 1}`}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+PoCBgRCgKRGhIRUiMpARFhIRkhKRIMZISEhESEhEREhEQERERERERERERERERERERERERERERERERERERERERERERERERERER0Z2Z3kN11Z6+r9v1v/8f3r8DGOqAACQQgASiOOBmIxCIJYBACiEEIAEBAFAgBBEBKIBBCAIIA=="
                              />
                            </div>
                          ))}
                        </Carousel>
                      </Image.PreviewGroup>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500 text-sm">
                          No business images available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Documents */}
                  <div>
                    <h4 className="text-base font-semibold mb-3 text-gray-700">
                      Aadhaar Documents
                    </h4>
                    {Array.isArray(formData.aadhaarDoc) &&
                    formData.aadhaarDoc.length > 0 ? (
                      <Image.PreviewGroup>
                        <Carousel
                          autoplay={false}
                          dots={true}
                          className="aadhaar-documents-carousel"
                        >
                          {formData.aadhaarDoc.map((url, idx) => (
                            <div key={idx}>
                              <Image
                                width="100%"
                                height={300}
                                style={{
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                                src={url}
                                alt={`Aadhaar Document ${idx + 1}`}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+PoCBgRCgKRGhIRUiMpARFhIRkhKRIMZISEhESEhEREhEQERERERERERERERERERERERERERERERERERERERERERERERERERER0Z2Z3kN11Z6+r9v1v/8f3r8DGOqAACQQgASiOOBmIxCIJYBACiEEIAEBAFAgBBEBKIBBCAIIA=="
                              />
                            </div>
                          ))}
                        </Carousel>
                      </Image.PreviewGroup>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500 text-sm">
                          No Aadhaar documents available
                        </p>
                      </div>
                    )}
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
    </VendorManagementRouteGuard>
  );
}
