import React, { useState } from "react";
import { Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import usePostQuery from "@/app/hooks/postQuery.hook";
import { apiUrls, apiBaseUrl } from "@/app/apis/index";
import {
  VideoCameraOutlined,
  AudioOutlined,
  FileImageOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface MediaUploaderProps {
  label: string;
  accept: string;
  fileList: UploadFile[];
  onChange: (fileList: UploadFile[]) => void;
  type: "image" | "video" | "audio" | "document"; // determines API
  icon?: React.ReactNode;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  accept,
  fileList,
  onChange,
  type,
  icon,
}) => {
  const { postQuery } = usePostQuery();
  const [uploading, setUploading] = useState(false);

  // Different upload API endpoints
  const uploadEndpoints: Record<typeof type, string> = {
    image: "/api/uploads/image",
    video: "/api/uploads/video",
    audio: "/api/uploads/audio",
    document: "/api/uploads/document",
  };

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      await postQuery({
        url: uploadEndpoints[type],
        postData: formData,
        headers: { "Content-Type": "multipart/form-data" },
        onSuccess: (res: any) => {
          const fileUrl = res?.url;
          if (fileUrl) {
            onChange([
              {
                uid: Date.now().toString(),
                name: file.name,
                status: "done",
                url: fileUrl,
              },
            ]);
            onSuccess?.(); // ✅ Let AntD know it's done
          } else {
            message.error(`Upload failed: No URL in response`);
            onError?.();
          }
        },
        onFail: () => {
          message.error(`${type} upload failed!`);
          onError?.();
        },
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block mb-1 text-sm text-gray-600">{label}</label>
      <Upload.Dragger
        style={{ border: "1px dotted #274699" }}
        fileList={fileList}
        customRequest={handleUpload}
        onChange={({ fileList }) => onChange(fileList)}
        maxCount={1}
        accept={accept}
      >
        <div className="flex flex-col items-center justify-center h-24 text-[#274699]">
          {icon}
          <p className="ant-upload-text mt-2 text-[#274699]">
            {uploading ? "Uploading..." : `Upload ${type} here`}
          </p>
        </div>
      </Upload.Dragger>
    </div>
  );
};

export default MediaUploader;
