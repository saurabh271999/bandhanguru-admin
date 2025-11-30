import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  multiple?: boolean;
  uploadUrlFunction: (file: File) => Promise<any>;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  accept = "image/*,video/*",
  multiple = false,
  uploadUrlFunction,
}) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (options: any) => {
    const { file } = options;
    if (!file) return;
    setLoading(true);

    try {
      const res = await uploadUrlFunction(file);
      const fileUrl = res?.url;
      if (fileUrl) {
        onUploadSuccess(fileUrl);
        options.onSuccess?.(res);
      } else {
        message.error("Upload failed: No URL in response");
        options.onError?.(new Error("No URL in response"));
      }
    } catch (err) {
      console.error(err);
      message.error("Upload failed!");
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      accept={accept}
      multiple={multiple}
      showUploadList={false}
    >
      <Button icon={<UploadOutlined />} loading={loading}>
        {loading ? "Uploading..." : "Click to Upload"}
      </Button>
    </Upload>
  );
};

export default FileUploader;
