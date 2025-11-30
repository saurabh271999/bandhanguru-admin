"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import CommonButton from "../../../components/commonbtn";
import UploadDocument from "@/app/components/upladDocument";
import { apiUrls } from "../../../apis";
import usePostQuery from "../../../hooks/postQuery.hook";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const { Option } = Select;

type FormValues = {
  category: string;
  subCategories: string[];
};

type SubCategory = {
  id: string;
  name: string;
  imageUrl: string; // URL managed by UploadDocument
};

const AddPartForm: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const { postQuery, loading: postLoading } = usePostQuery();
  const { messageApi, modal } = useUIProvider();

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      if (!values.category || !values.category.trim()) {
        messageApi.error("Category name is required");
        return;
      }

      const categoryData = {
        category_name: values.category.trim(),
        category_image: categoryImageUrl || null,
        subcategories: subCategories
          .map((sub) => sub.name.trim())
          .filter((name) => name.length > 0)
          .map((name, index) => ({
            subcategory_name: name,
            subcategory_image: subCategories[index].imageUrl || null,
          })),
      };

      await postQuery({
        url: apiUrls.createCategory,
        postData: categoryData,
        onSuccess: (response: any) => {
          console.log("Category created successfully:", response);
          form.resetFields();
          modal.success({
            title: "Category Created Successfully",
            content: `${values.category} has been added to the system.`,
            okText: "OK",
            onOk: () => router.push("/dashboard/categorymanagement"),
          });
        },
        onFail: (error: any) => {
          messageApi.error("Failed to create category. Please try again.");
          console.error("Failed to create category:", error);
        },
      });
    } catch (err) {
      console.error("Submission failed:", err);
      messageApi.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelbtn = () => {
    router.push("/dashboard/categorymanagement");
  };

  const addSubCategory = () => {
    setSubCategories((prev) => {
      // Prevent adding another empty input if the last one is already empty
      const hasTrailingEmpty =
        prev.length > 0 && prev[prev.length - 1].name.trim() === "";
      if (hasTrailingEmpty) return prev;
      const newSubCategory: SubCategory = {
        id: Date.now().toString(),
        name: "",
        imageUrl: "",
      };
      return [...prev, newSubCategory];
    });
  };

  const updateSubCategory = (id: string, value: string) => {
    setSubCategories((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, name: value } : sub))
    );
  };

  const updateSubCategoryImageUrl = (id: string, url: string) => {
    setSubCategories((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, imageUrl: url } : sub))
    );
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If no subcategories exist, create the first one
      if (subCategories.length === 0) {
        addSubCategory();
      }
      // Focus on the first subcategory input
      setTimeout(() => {
        const firstSubCategoryInput = document.querySelector(
          '[data-subcategory-index="0"]'
        ) as HTMLInputElement;
        if (firstSubCategoryInput) {
          firstSubCategoryInput.focus();
        }
      }, 150);
    }
  };

  const handleSubCategoryKeyDown = (
    e: React.KeyboardEvent,
    currentId: string,
    currentIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentInput = e.target as HTMLInputElement;
      const hasContent = currentInput.value.trim().length > 0;

      // If current field has content and it's the last one, ensure new subcategory exists
      if (hasContent && currentIndex === subCategories.length - 1) {
        // Check if a new field was already created by the onChange handler
        setTimeout(() => {
          const nextInput = document.querySelector(
            `[data-subcategory-index="${currentIndex + 1}"]`
          ) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          } else {
            // If no next input exists, create one and focus on it
            addSubCategory();
            setTimeout(() => {
              const newNextInput = document.querySelector(
                `[data-subcategory-index="${currentIndex + 1}"]`
              ) as HTMLInputElement;
              if (newNextInput) {
                newNextInput.focus();
              }
            }, 100);
          }
        }, 50);
      } else if (currentIndex < subCategories.length - 1) {
        // Move to next existing subcategory input
        const nextInput = document.querySelector(
          `[data-subcategory-index="${currentIndex + 1}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Remove empty subcategory inputs on blur so empty inputs are not shown
  const handleSubCategoryBlur = (id: string, index: number) => {
    setSubCategories((prev) => {
      const value = prev[index]?.name?.trim() ?? "";
      if (value === "") {
        return prev.filter((sub) => sub.id !== id);
      }
      return prev;
    });
  };

  const removeSubCategory = (id: string) => {
    setSubCategories((prev) => prev.filter((sub) => sub.id !== id));
  };

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-6 w-full bg-white mt-4">
      <div className="bg-white w-full rounded-lg shadow-lg p-3 md:p-6 lg:p-8 border border-[#A3D471] flex flex-col">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4 md:space-y-6"
        >
          <Form.Item
            label={
              <span className="text-sm md:text-base font-medium">
                Add Category
              </span>
            }
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
              className="border hover:border-[#274699] transition-colors text-sm md:text-base"
              onKeyDown={handleCategoryKeyDown}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm md:text-base font-medium">
                Category Image
              </span>
            }
          >
            <div className="max-w-xs">
              <UploadDocument
                value={categoryImageUrl}
                onChange={setCategoryImageUrl}
                variant="secondary"
              />
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm md:text-base font-medium">
                Sub Categories
              </span>
            }
          >
            <div className="space-y-3 md:space-y-4">
              {subCategories.map((subCategory, index) => (
                <div
                  key={subCategory.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Enter sub category name"
                      value={subCategory.name}
                      onChange={(e) =>
                        updateSubCategory(subCategory.id, e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleSubCategoryKeyDown(e, subCategory.id, index)
                      }
                      onBlur={() =>
                        handleSubCategoryBlur(subCategory.id, index)
                      }
                      className="border hover:border-[#274699] transition-colors text-sm md:text-base"
                      data-subcategory-index={index}
                      size="large"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="w-full sm:w-auto">
                      <UploadDocument
                        value={subCategory.imageUrl}
                        onChange={(url) =>
                          updateSubCategoryImageUrl(subCategory.id, url)
                        }
                        variant="secondary"
                      />
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSubCategory(subCategory.id)}
                      size="small"
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
              {subCategories.length === 0 && (
                <Button
                  type="dashed"
                  onClick={addSubCategory}
                  icon={<PlusOutlined />}
                  className="w-full h-12 border-2 border-dashed hover:border-[#274699] transition-colors"
                  size="large"
                >
                  Add Sub Category
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <div className="mt-6 md:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
              <CommonButton
                label="Cancel"
                onClick={handleCancelbtn}
                className="w-full sm:w-auto"
              />
              <CommonButton
                label="Submit"
                onClick={() => form.submit()}
                loading={loading || postLoading}
                type="primary"
                variant="primary"
                className="w-full sm:w-auto"
              />
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddPartForm;
