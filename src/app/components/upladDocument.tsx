import { Button, Upload, UploadFile, Image } from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import usePostQuery from "../hooks/postQuery.hook";
import { apiUrls } from "../apis";

interface UploadDocumentProps {
  value?: string;
  onChange: (value: string) => void;
  isSiteSurvey?: boolean;
  variant?: "primary" | "secondary";
  buttonHeight?: number | string;
}

const UploadDocument = ({
  value,
  onChange,
  isSiteSurvey = false,
  variant = "primary",
  buttonHeight = 40,
}: UploadDocumentProps) => {
  const { postQuery } = usePostQuery();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Update fileList when value changes (for edit mode)
  useEffect(() => {
    const isValidExistingUrl =
      typeof value === "string" &&
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:image"));

    if (isValidExistingUrl) {
      setFileList([
        {
          uid: "-1",
          name: "existing-image",
          status: "done",
          url: value,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value]);
  const handleBase64String = (fileList: UploadFile<any>[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const file = fileList[0]?.originFileObj as File;
      if (!file) {
        reject("No file provided");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleItemChange = async (fileList: UploadFile<any>[]) => {
    setFileList(fileList);

    if (!fileList || fileList.length === 0) {
      onChange("");
      return;
    }

    try {
      const base64String = await handleBase64String(fileList);
      // Use uploadImage endpoint for profile images
      postQuery({
        url: apiUrls.uploadImage, // Changed back to uploadImage for profile images
        onSuccess: (res: any) => {
          const fileUrl =
            res?.data || res?.url || res?.fileUrl || res?.file || "";
          onChange(fileUrl);
        },
        onFail: (err: any) => { },
        postData: { base64String },
      });
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const handlePreview = (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl || "");
    setPreviewVisible(true);
  };

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      // Upload the file
      postQuery({
        url: apiUrls.uploadImage,
        onSuccess: (res: any) => {
          const fileUrl = res?.data || res?.url || res?.fileUrl || res?.file || "";
          onChange(fileUrl);
          setIsUploading(false);
          toast.success("Image added successfully!");
          onSuccess(res);
        },
        onFail: (err: any) => {
          console.error("Upload failed:", err);
          setIsUploading(false);
          toast.error("Failed to upload image");
          onError(err);
        },
        postData: { base64String },
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setIsUploading(false);
      toast.error("Failed to process file");
      onError(error);
    }
  };

  // Primary variant (existing style)
  const renderPrimaryVariant = () => (
    <>
      {isSiteSurvey ? (
        <div className="upload-responsive-container">
        <Upload
            fileList={fileList}
          onChange={({ fileList, file }) => {
            handleItemChange(fileList);
          }}
            onPreview={handlePreview}
          maxCount={1}
            accept="image/*"
          listType="picture-card"
          style={{ width: "100%" }}
          className="upload-no-border"
          >
            {fileList.length >= 1 ? null : (
          <Button
            icon={<UploadOutlined />}
            loading={isUploading}
            disabled={isUploading}
            style={{
                  width: "100%",
              height: "120px",
              marginTop: "8px",
            }}
          >
                {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
            )}
        </Upload>
          {value && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
              <div className="relative inline-block">
                <Image
                  src={value}
                  alt="Uploaded image"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  preview={{
                    mask: <EyeOutlined style={{ fontSize: '16px' }} />,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
        <Upload
            fileList={fileList}
            style={{ width: "100%" }}
          onChange={({ fileList }) => {
            setFileList(fileList);
          }}
            onPreview={handlePreview}
          maxCount={1}
          accept="image/*,.pdf,.doc,.docx"
          listType="text"
          showUploadList={false}
          customRequest={handleCustomRequest}
          >
            <Button 
              icon={<UploadOutlined />} 
              className="w-full"
              loading={isUploading}
              disabled={isUploading}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #C0C0C0",
                boxShadow: "none",
                height: "35px"
              }}
            >
              {isUploading ? "Uploading..." : "Click to Upload"}
          </Button>
        </Upload>
          {value && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
              <div className="relative inline-block">
                <Image
                  src={value}
                  alt="Uploaded image"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  preview={{
                    mask: <EyeOutlined style={{ fontSize: '16px' }} />,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  // Secondary variant (matching add user page style)
  const renderSecondaryVariant = () => (
    <div>
    <Upload
        fileList={fileList}
      style={{ width: "100%" }}
      onChange={({ fileList, file }) => {
        console.log("Upload onChange triggered:", { fileList, file });
        setFileList(fileList);
      }}
        onPreview={handlePreview}
      maxCount={1}
        accept="image/*,.pdf,.doc,.docx,.txt"
        listType="text"
        showUploadList={false}
        customRequest={handleCustomRequest}
      >
      <Button
        icon={<UploadOutlined />}
        style={{
            height: typeof buttonHeight === 'number' ? `${buttonHeight}px` : buttonHeight,
          width: "100%",
          color: "#274699",
          fontWeight: "500",
          fontSize: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid #C0C0C0",
            backgroundColor: "transparent",
            boxShadow: "none"
        }}
        loading={isUploading}
        disabled={isUploading}
      >
          {isUploading ? "Uploading..." : "Upload Here"}
      </Button>
    </Upload>
      {value && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
          <div className="relative inline-block">
            <Image
              src={value}
              alt="Uploaded image"
              style={{
                maxWidth: '200px',
                maxHeight: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
              preview={{
                mask: <EyeOutlined style={{ fontSize: '16px' }} />,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {variant === "primary"
        ? renderPrimaryVariant()
        : renderSecondaryVariant()}

      {/* Image Preview Modal */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
          src: previewImage,
        }}
      />
    </>
  );
};

export default UploadDocument;
