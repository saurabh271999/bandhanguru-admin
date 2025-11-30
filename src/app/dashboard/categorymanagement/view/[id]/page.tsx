"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useGetQuery from "@/app/hooks/getQuery.hook";
import useDeleteQuery from "@/app/hooks/deleteQuery.hook";
import { apiUrls } from "@/app/apis";
import { Spin, Tag, Card, List, Divider, Button } from "antd";
import { Eye, ChevronLeft } from "lucide-react";
import CommonButton from "@/app/components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";

const ViewCategoryPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getQuery } = useGetQuery();
  const { messageApi, modal } = useUIProvider();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);

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

  const getId = (c: any) => c?.category_id || c?.id || c?._id;
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

  return (
    <div className="p-0 md:p-2 w-full flex bg-white mt-4">
      <div className="bg-white w-full rounded-lg shadow-lg p-2 md:p-6 border border-[#A3D471] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#274699]" />
            <h2 className="text-lg font-semibold text-black">
              Category Details
            </h2>
          </div>
          <div className="flex gap-2">
            <CommonButton
              label="Back"
              onClick={() => router.push("/dashboard/categorymanagement")}
            />
            <CommonButton
              label="Edit"
              onClick={() =>
                router.push(
                  `/dashboard/categorymanagement/edit/${getId(category)}`
                )
              }
            />
            <Button
              danger
              loading={deleteLoading}
              onClick={() => {
                modal.confirm({
                  title: "Delete Category",
                  content: `Are you sure you want to delete category "${getName(
                    category
                  )}"? This action cannot be undone.`,
                  okText: "Delete",
                  okButtonProps: { danger: true },
                  cancelText: "Cancel",
                  onOk: async () => {
                    await deleteQuery({
                      url: apiUrls.deleteCategoryId(getId(category)),
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
            >
              Delete
            </Button>
          </div>
        </div>

        <Card bordered className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
            <div>
              <div className="text-gray-500 text-xs">Category ID</div>
              <div className="font-medium">{getId(category)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Category Name</div>
              <div className="font-medium">{getName(category)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Status</div>
              {getActive(category) ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </div>
          </div>
        </Card>

        <Divider orientation="left">Subcategories</Divider>
        {subs.length === 0 ? (
          <div className="text-gray-500 text-sm">No subcategories</div>
        ) : (
          <List
            dataSource={subs}
            bordered
            renderItem={(item: any) => (
              <List.Item className="flex justify-between">
                <div className="text-black">
                  {item?.subcategory_name || item?.name || item?.subcategory}
                </div>
                <div>
                  {typeof item?.isActive === "boolean" ? (
                    item.isActive ? (
                      <Tag color="green">Active</Tag>
                    ) : (
                      <Tag color="red">Inactive</Tag>
                    )
                  ) : null}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ViewCategoryPage;
