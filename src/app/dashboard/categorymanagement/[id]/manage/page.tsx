"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useGetQuery from "@/app/hooks/getQuery.hook";
import useDeleteQuery from "@/app/hooks/deleteQuery.hook";
import usePutQuery from "@/app/hooks/putQuery.hook";
import { apiUrls } from "@/app/apis";
import { Spin, Tag, Card, List, Divider, Button, Input, Image } from "antd";
import { Settings, ChevronLeft, Eye, Trash2, Plus } from "lucide-react";
import CommonButton from "@/app/components/commonbtn";
import UploadDocument from "@/app/components/upladDocument";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const ManageCategoryPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getQuery } = useGetQuery();
  const { messageApi, modal } = useUIProvider();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();
  const { putQuery, loading: putLoading } = usePutQuery();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [catName, setCatName] = useState("");
  const [subsEdited, setSubsEdited] = useState<any[]>([]);
  const [subFilter, setSubFilter] = useState("");

  // Image management states
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [subcategoryImages, setSubcategoryImages] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getQuery({
          url: apiUrls.editCategoryById(id),
          onSuccess: (data: any) => {
            const cat =
              data?.category || data?.data?.category || data?.data || data;
            if (!cat) {
              fetchFromAll();
              return;
            }
            setCategory(cat);
            setCatName(getName(cat));
            setCategoryImageUrl(cat.category_image || cat.image || "");

            // Initialize subcategory images
            const subImages: Record<string, string> = {};
            (getSubcategories(cat) as any[]).forEach((sub: any) => {
              const subId = sub.subcategory_id || sub.id;
              if (subId) {
                subImages[subId] = sub.subcategory_image || sub.image || "";
              }
            });
            setSubcategoryImages(subImages);

            setSubsEdited(
              (getSubcategories(cat) as any[]).map((s: any) => ({
                subcategory_id: s.subcategory_id,
                subcategory_name: s.subcategory_name || s.name || s.subcategory,
                isActive: typeof s.isActive === "boolean" ? s.isActive : true,
                _status: "existing", // existing | new | deleted
                _changed: false,
              }))
            );
            setLoading(false);
          },
          onFail: () => fetchFromAll(),
        });
      } catch (e) {
        fetchFromAll();
      }
    };

    const fetchFromAll = async () => {
      try {
        await getQuery({
          url: apiUrls.getAllCategories,
          onSuccess: (data: any) => {
            let categories: any[] = [];
            if (data?.categories) categories = data.categories;
            else if (data?.data?.categories) categories = data.data.categories;
            else if (Array.isArray(data)) categories = data;
            else if (Array.isArray(data?.data)) categories = data.data;

            const cat = categories.find(
              (c: any) => c._id === id || c.id === id || c.category_id === id
            );
            if (!cat) {
              messageApi.error("Category not found");
              router.push("/dashboard/categorymanagement");
              return;
            }
            setCategory(cat);
            setLoading(false);
          },
          onFail: () => {
            messageApi.error("Failed to load category details");
            router.push("/dashboard/categorymanagement");
          },
        });
      } catch (e) {
        messageApi.error("An error occurred while loading category details");
        router.push("/dashboard/categorymanagement");
      }
    };

    if (id) fetchData();
  }, [id, getQuery, messageApi, router]);

  const getId = (c: any) => c?._id || c?.id || c?.category_id;
  const getName = (c: any) => c?.category_name || c?.name || c?.category;
  const getActive = (c: any) =>
    typeof c?.isActive === "boolean" ? c.isActive : true;
  const getSubcategories = (c: any) =>
    c?.subcategories || c?.sub_categories || [];

  if (loading) {
    return (
      <div className="h-[500px] p-2 w-full flex bg-white items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) return null;

  const subs = getSubcategories(category) as any[];
  const originalSubs = subs as any[];

  // Apply filter (case-insensitive) for both view and edit modes
  const filteredSubs = !editMode
    ? subs.filter((s: any) =>
        (s?.subcategory_name || s?.name || s?.subcategory || "")
          .toString()
          .toLowerCase()
          .includes(subFilter.toLowerCase())
      )
    : subsEdited.filter((s: any) =>
        (s?.subcategory_name || "")
          .toString()
          .toLowerCase()
          .includes(subFilter.toLowerCase())
      );

  const toggleEditMode = () => setEditMode((v) => !v);

  const handleAddSub = () => {
    setSubsEdited((prev) => [
      ...prev,
      {
        subcategory_id: undefined,
        subcategory_name: "",
        isActive: true,
        _status: "new",
        _changed: true,
        _tempId: Date.now().toString(),
      },
    ]);
  };

  const handleSubChange = (key: string, value: any, idx: number) => {
    setSubsEdited((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value, _changed: true };
      return next;
    });
  };

  const handleDeleteSub = (idx: number) => {
    setSubsEdited((prev) => {
      const s = prev[idx];
      // If it's new, remove entirely; if existing, mark deleted
      if (s._status === "new") {
        return prev.filter((_, i) => i !== idx);
      }
      const next = [...prev];
      next[idx] = { ...s, _status: "deleted", _changed: true };
      return next;
    });
  };

  // Image management functions
  const handleCategoryImageUpdate = (imageUrl: string) => {
    setCategoryImageUrl(imageUrl);
  };

  const handleCategoryImageDelete = () => {
    setCategoryImageUrl("");
    messageApi.success("Category image removed");
  };

  const handleSubcategoryImageUpdate = (
    subcategoryId: string,
    imageUrl: string
  ) => {
    setSubcategoryImages((prev) => ({
      ...prev,
      [subcategoryId]: imageUrl,
    }));
  };

  const handleSubcategoryImageDelete = (subcategoryId: string) => {
    setSubcategoryImages((prev) => ({
      ...prev,
      [subcategoryId]: "",
    }));
    messageApi.success("Subcategory image removed");
  };

  const buildManagePayload = () => {
    const payload: any = {};

    // Category changes
    const origName = getName(category);
    const origImage = category.category_image || category.image || "";
    const catChanged = catName.trim() !== origName;
    const imageChanged = categoryImageUrl !== origImage;

    if (catChanged || imageChanged) {
      payload.category = {
        category_name: catName.trim(),
      };
      if (imageChanged) {
        payload.category.category_image = categoryImageUrl || null;
      }
    }

    // Subcategory ops
    const subOps: any[] = [];
    for (const s of subsEdited) {
      if (s._status === "new") {
        if (s.subcategory_name && s.subcategory_name.trim()) {
          const subData: any = {
            subcategory_name: s.subcategory_name.trim(),
          };
          const subId = s.subcategory_id || s._tempId;
          if (subId && subcategoryImages[subId]) {
            subData.subcategory_image = subcategoryImages[subId];
          }
          subOps.push({
            op: "add",
            data: subData,
          });
        }
      } else if (s._status === "deleted") {
        if (s.subcategory_id) {
          subOps.push({ op: "delete", id: s.subcategory_id });
        }
      } else if (s._status === "existing" && s._changed) {
        // compare with original to see if real change
        const orig = originalSubs.find(
          (o: any) => o.subcategory_id === s.subcategory_id
        );
        const newName = s.subcategory_name?.trim();
        const oldName =
          orig?.subcategory_name || orig?.name || orig?.subcategory;
        const origImage = orig?.subcategory_image || orig?.image || "";
        const newImage = subcategoryImages[s.subcategory_id] || "";

        const nameChanged = newName !== oldName;
        const imageChanged = newImage !== origImage;

        if (nameChanged || imageChanged) {
          if (s.subcategory_id) {
            const updateData: any = {};
            if (nameChanged) updateData.subcategory_name = newName;
            if (imageChanged) updateData.subcategory_image = newImage || null;

            subOps.push({
              op: "update",
              id: s.subcategory_id,
              data: updateData,
            });
          }
        }
      }
    }
    if (subOps.length > 0) payload.subcategories = subOps;
    return payload;
  };

  const handleSave = async () => {
    if (editMode && !catName.trim()) {
      messageApi.error("Category name is required");
      return;
    }
    const payload = buildManagePayload();
    if (!payload.category && !payload.subcategories) {
      messageApi.info("No changes to save");
      setEditMode(false);
      return;
    }
    await putQuery({
      url: apiUrls.manageCategoryById(getId(category)),
      putData: payload,
      onSuccess: (data: any) => {
        messageApi.success("Category updated successfully");
        // Refresh with server data
        const updated = data?.data || data?.category || data;
        if (updated) {
          setCategory(updated);
          setCatName(getName(updated));
          setCategoryImageUrl(updated.category_image || updated.image || "");

          // Update subcategory images
          const updatedSubImages: Record<string, string> = {};
          (getSubcategories(updated) as any[]).forEach((sub: any) => {
            const subId = sub.subcategory_id || sub.id;
            if (subId) {
              updatedSubImages[subId] =
                sub.subcategory_image || sub.image || "";
            }
          });
          setSubcategoryImages(updatedSubImages);

          setSubsEdited(
            (getSubcategories(updated) as any[]).map((s: any) => ({
              subcategory_id: s.subcategory_id,
              subcategory_name: s.subcategory_name || s.name || s.subcategory,
              isActive: typeof s.isActive === "boolean" ? s.isActive : true,
              _status: "existing",
              _changed: false,
            }))
          );
        }
        setEditMode(false);
      },
      onFail: () => {
        messageApi.error("Failed to save changes");
      },
    });
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 w-full bg-gray-50 mt-4">
      <div className="bg-white w-full rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border border-[#A3D471] flex flex-col max-w-7xl mx-auto">
        {/* Header Section - Improved Mobile Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings size={18} className="text-[#274699] flex-shrink-0" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black">
              Manage Category
            </h2>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
              <CommonButton
                label="Back"
                onClick={() => router.push("/dashboard/categorymanagement")}
                className="w-full sm:w-auto text-sm"
              />
              {!editMode ? (
                <CommonButton
                  label="Edit"
                  onClick={toggleEditMode}
                  className="w-full sm:w-auto text-sm"
                />
              ) : (
                <CommonButton
                  label="Save"
                  onClick={handleSave}
                  loading={putLoading}
                  type="primary"
                  variant="primary"
                  className="w-full sm:w-auto text-sm"
                />
              )}
            </div>

            {/* Delete Button - Mobile Friendly */}
            <div className="order-1 sm:order-2">
              <Button
                danger
                loading={deleteLoading}
                onClick={() => {
                  const idToDelete = getId(category);
                  if (!idToDelete) {
                    messageApi.error("Cannot delete: missing _id");
                    return;
                  }
                  console.log("Delete clicked for id:", idToDelete);
                  messageApi.info("Opening delete confirmation...");
                  modal.confirm({
                    title: "Delete Category",
                    content: `Are you sure you want to delete category "${getName(
                      category
                    )}"? This action cannot be undone.`,
                    okText: "Delete",
                    okButtonProps: { danger: true },
                    cancelText: "Cancel",
                    onOk: async () => {
                      console.log("Delete confirmed for id:", idToDelete);
                      await deleteQuery({
                        url: apiUrls.deleteCategoryId(idToDelete),
                        onSuccess: () => {
                          messageApi.success("Category deleted successfully");
                          router.push("/dashboard/categorymanagement");
                        },
                        onFail: () => {
                          messageApi.error("Failed to delete category");
                        },
                      });
                    },
                  });
                }}
                className="w-full sm:w-auto"
                size="middle"
              >
                <Trash2 size={16} className="sm:hidden" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Category Information Card - Enhanced Mobile Layout */}
        <Card bordered className="mb-4 sm:mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-black">
            {/* Category Name Section */}
            <div className="space-y-2">
              <div className="text-gray-500 text-xs sm:text-sm font-medium">
                Category Name
              </div>
              {!editMode ? (
                <div className="font-medium text-sm sm:text-base break-words">
                  {getName(category)}
                </div>
              ) : (
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Enter category name"
                  className="text-sm sm:text-base"
                  size="large"
                />
              )}
            </div>

            {/* Category Image Section */}
            <div className="space-y-2">
              <div className="text-gray-500 text-xs sm:text-sm font-medium">
                Category Image
              </div>
              {!editMode ? (
                <div className="flex items-center gap-3">
                  {categoryImageUrl ? (
                    <div className="relative group">
                      <Image
                        src={categoryImageUrl}
                        alt="Category"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #e5e7eb",
                        }}
                        preview={{
                          mask: <Eye size={14} />,
                        }}
                        className="cursor-pointer hover:border-[#274699] transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="w-[50px] h-[50px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadDocument
                    value={categoryImageUrl}
                    onChange={handleCategoryImageUpdate}
                    variant="secondary"
                    buttonHeight={36}
                  />
                  {categoryImageUrl && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<Trash2 size={14} />}
                      onClick={handleCategoryImageDelete}
                      className="text-xs h-8"
                    >
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <div className="text-gray-500 text-xs sm:text-sm font-medium">
                Status
              </div>
              <div className="flex items-center">
                {getActive(category) ? (
                  <Tag color="green" className="text-xs sm:text-sm px-2 py-1">
                    Active
                  </Tag>
                ) : (
                  <Tag color="red" className="text-xs sm:text-sm px-2 py-1">
                    Inactive
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Subcategories Section */}
        <Divider orientation="left" className="text-sm sm:text-base">
          Subcategories
        </Divider>

        {/* Filter Input - Mobile Optimized */}
        <div className="w-full mb-3 sm:mb-4">
          <Input
            placeholder="Filter subcategories by name..."
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            allowClear
            size="large"
            className="text-sm sm:text-base"
            prefix={<span className="text-gray-400">🔍</span>}
          />
        </div>

        {/* Subcategories List - Enhanced Mobile Layout */}
        {!editMode && subs.length === 0 ? (
          <div className="text-gray-500 text-sm sm:text-base text-center py-8 bg-gray-50 rounded-lg">
            No subcategories found
          </div>
        ) : !editMode ? (
          <List
            dataSource={filteredSubs}
            bordered
            className="bg-white"
            renderItem={(item: any) => (
              <List.Item className="hover:bg-gray-50 transition-colors px-3 sm:px-4 py-3 sm:py-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full">
                  {/* Image Section */}
                  <div className="flex-shrink-0">
                    {subcategoryImages[item.subcategory_id || item.id] ? (
                      <Image
                        src={subcategoryImages[item.subcategory_id || item.id]}
                        alt="Subcategory"
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "2px solid #e5e7eb",
                        }}
                        preview={{
                          mask: <Eye size={12} />,
                        }}
                        className="cursor-pointer hover:border-[#274699] transition-colors"
                      />
                    ) : (
                      <div className="w-[45px] h-[45px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <span className="text-xs text-gray-400">No Img</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="text-black font-medium text-sm sm:text-base break-words">
                      {item?.subcategory_name ||
                        item?.name ||
                        item?.subcategory}
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="flex-shrink-0 ml-2">
                    {typeof item?.isActive === "boolean" ? (
                      item.isActive ? (
                        <Tag color="green" className="text-xs px-2 py-0.5">
                          Active
                        </Tag>
                      ) : (
                        <Tag color="red" className="text-xs px-2 py-0.5">
                          Inactive
                        </Tag>
                      )
                    ) : null}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="border rounded-lg shadow-sm bg-white">
            {/* Add Subcategory Button - Mobile Optimized */}
            <div className="flex justify-end p-3 sm:p-4 border-b">
              <Button
                type="dashed"
                onClick={handleAddSub}
                icon={<Plus size={16} />}
                size="large"
                className="w-full sm:w-auto h-10 sm:h-auto text-sm sm:text-base"
              >
                <span className="sm:hidden">Add Subcategory</span>
                <span className="hidden sm:inline">Add Subcategory</span>
              </Button>
            </div>

            {/* Subcategories Edit List */}
            <div className="divide-y divide-gray-100">
              {filteredSubs.map((s, idx) => {
                const subId = s.subcategory_id || s._tempId;
                const currentImageUrl = subcategoryImages[subId] || "";
                return (
                  <div
                    key={
                      s.subcategory_id ||
                      s._tempId ||
                      `${s.subcategory_name}-${idx}`
                    }
                    className={`p-4 sm:p-6 ${
                      s._status === "deleted"
                        ? "opacity-50 bg-red-50"
                        : "bg-white"
                    } ${
                      s._changed && s._status !== "deleted"
                        ? "ring-2 ring-yellow-400 rounded-lg"
                        : ""
                    } transition-all duration-200`}
                  >
                    {/* Mobile Layout: Stack vertically, Desktop: Side by side */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                      {/* Left Section: Name and Upload */}
                      <div className="flex-1 space-y-3 lg:space-y-4 min-w-0">
                        {/* Subcategory Name Input */}
                        <div className="space-y-1">
                          <label className="text-xs sm:text-sm font-medium text-gray-600 block">
                            Subcategory Name
                          </label>
                          <Input
                            placeholder="Enter subcategory name"
                            value={s.subcategory_name}
                            disabled={s._status === "deleted"}
                            onChange={(e) =>
                              handleSubChange(
                                "subcategory_name",
                                e.target.value,
                                subsEdited.findIndex(
                                  (x) =>
                                    (x.subcategory_id || x._tempId) ===
                                    (s.subcategory_id || s._tempId)
                                )
                              )
                            }
                            className="w-full text-sm sm:text-base"
                            size="large"
                          />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium text-gray-600 block">
                            Subcategory Image
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                              <UploadDocument
                                value={currentImageUrl}
                                onChange={(url) =>
                                  handleSubcategoryImageUpdate(subId, url)
                                }
                                variant="secondary"
                                buttonHeight={40}
                              />
                            </div>
                            {currentImageUrl && (
                              <Button
                                type="text"
                                danger
                                size="large"
                                icon={<Trash2 size={14} />}
                                onClick={() =>
                                  handleSubcategoryImageDelete(subId)
                                }
                                className="flex-shrink-0 h-10 px-3 text-sm"
                              >
                                <span className="hidden sm:inline ml-1">
                                  Remove
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Preview and Actions */}
                      <div className="flex items-start gap-3 lg:gap-4 flex-shrink-0">
                        {/* Image Preview */}
                        {currentImageUrl && (
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <Image
                                src={currentImageUrl}
                                alt="Subcategory preview"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "2px solid #e5e7eb",
                                }}
                                preview={{
                                  mask: <Eye size={14} />,
                                }}
                                className="cursor-pointer hover:border-[#274699] transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {s._status !== "deleted" ? (
                            <Button
                              danger
                              onClick={() =>
                                handleDeleteSub(
                                  subsEdited.findIndex(
                                    (x) =>
                                      (x.subcategory_id || x._tempId) ===
                                      (s.subcategory_id || s._tempId)
                                  )
                                )
                              }
                              size="middle"
                              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                              icon={<Trash2 size={14} />}
                            >
                              <span className="hidden sm:inline ml-1">
                                Delete
                              </span>
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                handleSubChange(
                                  "_status",
                                  "existing",
                                  subsEdited.findIndex(
                                    (x) =>
                                      (x.subcategory_id || x._tempId) ===
                                      (s.subcategory_id || s._tempId)
                                  )
                                )
                              }
                              size="middle"
                              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                            >
                              <span className="text-xs sm:text-sm">Undo</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {subsEdited.length === 0 && (
                <div className="p-6 sm:p-8 text-center text-gray-500 bg-gray-50">
                  <div className="text-sm sm:text-base mb-2">
                    No subcategories found
                  </div>
                  <div className="text-xs sm:text-sm">
                    Click "Add Subcategory" to create your first subcategory
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategoryPage;
