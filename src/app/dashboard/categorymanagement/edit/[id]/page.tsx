"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Spin, Image } from "antd";
import CommonButton from "../../../../components/commonbtn";
import MediaUploader from "../../../../components/Uploader/mediaUploader";
import usePutQuery from "../../../../hooks/putQuery.hook";
import useGetQuery from "../../../../hooks/getQuery.hook";
import { apiUrls } from "../../../../apis";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import type { UploadFile } from "antd/es/upload/interface";

type FormValues = {
  id: string;
  category: string;
  category_image?: string;
};

const EditCategoryForm: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [categoryImage, setCategoryImage] = useState<UploadFile[]>([]);
  const { putQuery, loading: putLoading } = usePutQuery();
  const { getQuery } = useGetQuery();
  const { messageApi, modal } = useUIProvider();

  // Fetch existing category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setInitialLoading(true);
        // First try to get individual category
        await getQuery({
          url: apiUrls.editCategoryById(categoryId),
          onSuccess: (data: any) => {
            console.log("Individual category data fetched:", data);
            // Handle different possible response structures
            let categoryData = null;

            if (data?.category) {
              categoryData = data.category;
            } else if (data?.data?.category) {
              categoryData = data.data.category;
            } else if (data?.data) {
              categoryData = data.data;
            } else if (data) {
              categoryData = data;
            }

            if (categoryData) {
              // Pre-fill the form with existing data
              const formDataToSet = {
                id:
                  categoryData.category_id ||
                  categoryData.id ||
                  categoryData._id,
                category:
                  categoryData.category_name ||
                  categoryData.name ||
                  categoryData.category,
                category_image: categoryData.category_image || ''
              };
              
              // Set the category image if it exists
              if (categoryData.category_image) {
                setCategoryImage([{
                  uid: '-1',
                  name: 'category-image',
                  status: 'done',
                  url: categoryData.category_image,
                  thumbUrl: categoryData.category_image
                }]);
              }
              setFormData(formDataToSet);
              form.setFieldsValue(formDataToSet);
              setInitialLoading(false);
            } else {
              fetchFromAllCategories();
            }
          },
          onFail: (error: any) => {
            console.error("Failed to fetch individual category:", error);
            fetchFromAllCategories();
          },
        });
      } catch (error) {
        console.error("Error fetching category:", error);
        messageApi.error("An error occurred while loading category data");
        router.push("/dashboard/categorymanagement");
      }
    };

    const fetchFromAllCategories = async () => {
      try {
        await getQuery({
          url: apiUrls.getAllCategories,
          onSuccess: (data: any) => {
            console.log("All categories data fetched:", data);
            let categories = [];

            if (data?.categories) {
              categories = data.categories;
            } else if (data?.data?.categories) {
              categories = data.data.categories;
            } else if (Array.isArray(data)) {
              categories = data;
            } else if (Array.isArray(data?.data)) {
              categories = data.data;
            }

            const category = categories.find(
              (cat: any) =>
                cat._id === categoryId ||
                cat.id === categoryId ||
                cat.category_id === categoryId
            );

            if (category) {
              const formDataToSet = {
                id: category.category_id || category.id || category._id,
                category:
                  category.category_name || category.name || category.category,
              };
              setFormData(formDataToSet);
              form.setFieldsValue(formDataToSet);
              console.log(
                "Form fields set from all categories:",
                formDataToSet
              );
            } else {
              messageApi.error("Category not found");
              router.push("/dashboard/categorymanagement");
            }
          },
          onFail: (error: any) => {
            console.error("Failed to fetch all categories:", error);
            messageApi.error("Failed to load category data");
            router.push("/dashboard/categorymanagement");
          },
        });
      } catch (error) {
        console.error("Error in fetchFromAllCategories:", error);
        messageApi.error("An error occurred while loading category data");
        router.push("/dashboard/categorymanagement");
      } finally {
        setInitialLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, getQuery, form, messageApi, router]);

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      if (!values.id || !values.id.trim()) {
        messageApi.error("ID is required");
        return;
      }

      if (!values.category || !values.category.trim()) {
        messageApi.error("Category name is required");
        return;
      }

      const categoryData = {
        category_id: values.id.trim(),
        category_name: values.category.trim(),
        category_image: categoryImage.length > 0 ? categoryImage[0].url : null,
      };

      await putQuery({
        url: apiUrls.editCategoryById(categoryId),
        putData: categoryData,
        onSuccess: (response: any) => {
          console.log("Category updated successfully:", response);
          modal.success({
            title: "Category Updated Successfully",
            content: `${values.category} has been updated in the system.`,
            okText: "OK",
            onOk: () => router.push("/dashboard/categorymanagement"),
          });
        },
        onFail: (error: any) => {
          console.error("Failed to update category:", error);
          messageApi.error("Failed to update category. Please try again.");
        },
      });
    } catch (err) {
      console.error("Update failed:", err);
      messageApi.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelbtn = () => {
    router.push("/dashboard/categorymanagement");
  };

  if (initialLoading) {
    return (
      <div className="h-[500px] p-2 w-full flex bg-white items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-[500px] p-0 md:p-2 w-full flex bg-white mt-4">
      <div className="bg-white w-full rounded-lg shadow-lg p-2 md:p-6 border border-[#A3D471] flex flex-col">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
          key={formData ? JSON.stringify(formData) : "loading"}
          initialValues={formData}
        >
          <Form.Item
            label="Category ID"
            name="id"
            rules={[
              { required: true, message: "Please enter ID" },
              { min: 1, message: "ID cannot be empty" },
              { whitespace: true, message: "ID cannot be only spaces" },
            ]}
          >
            <Input
              placeholder="Enter ID"
              className="border hover:border-[#274699] transition-colors"
            />
          </Form.Item>

          <Form.Item
            label="Category Name"
            name="category"
            rules={[
              { required: true, message: "Please enter category name" },
              { min: 1, message: "Category name cannot be empty" },
              {
                whitespace: true,
                message: "Category name cannot be only spaces",
              },
            ]}
          >
            <Input
              placeholder="Enter Category"
              className="border hover:border-[#274699] transition-colors"
            />
          </Form.Item>

          <Form.Item label="Category Image">
            <div className="mb-2">
              {categoryImage.length > 0 && categoryImage[0].url && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                  <div className="border rounded p-2 inline-block">
                    <Image
                      src={categoryImage[0].url}
                      alt="Category"
                      width={150}
                      height={150}
                      className="object-cover rounded"
                    />
                  </div>
                </div>
              )}
              <MediaUploader
                label={categoryImage.length > 0 ? "Change Image" : "Upload Image"}
                accept="image/*"
                fileList={categoryImage}
                onChange={setCategoryImage}
                type="image"
              />
              {categoryImage.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryImage([])}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <div className="mt-5 flex flex-row space-x-3 justify-end sm:flex-row  space-y-2 sm:space-y-0 sm:space-x-3">
              <CommonButton label="Cancel" onClick={handleCancelbtn} />
              <CommonButton
                label="Update"
                onClick={() => form.submit()}
                loading={loading || putLoading}
                type="primary"
                variant="primary"
              />
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EditCategoryForm;
