"use client";

import React, { useState } from "react";
import { Modal, Button, Typography, Space, Alert, message } from "antd";
import { InfoCircleOutlined, DownloadOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

interface DocumentInfoModalProps {
  visible: boolean;
  onCancel: () => void;
  documentUrl?: string;
  fileName?: string;
  documentType?: string;
  uploadDate?: string;
  fileSize?: string;
}

const DocumentInfoModal: React.FC<DocumentInfoModalProps> = ({
  visible,
  onCancel,
  documentUrl,
  fileName,
  documentType,
  uploadDate,
  fileSize,
}) => {
  const hasDocument = documentUrl && 
    documentUrl.trim() !== "" && 
    documentUrl !== "null" && 
    documentUrl !== "undefined" && 
    documentUrl !== "[]";

  const isImage = documentType === 'image' || 
    (documentUrl && (documentUrl.includes('.jpg') || documentUrl.includes('.jpeg') || 
     documentUrl.includes('.png') || documentUrl.includes('.gif') || 
     documentUrl.includes('.webp') || documentUrl.includes('.avif')));

  const handleDownload = async () => {
    if (!documentUrl) {
      message.error('No document available for download');
      return;
    }

    try {
      // Try to fetch as blob first (for same-origin or CORS-enabled files)
      const response = await fetch(documentUrl, { 
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
        
        message.success('Document downloaded successfully!');
        onCancel();
        return;
      }
    } catch (error) {
      console.log('CORS fetch failed, trying alternative method:', error);
    }

    // Fallback: Try direct download with download attribute
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Download initiated! Check your downloads folder.');
      onCancel();
    } catch (fallbackError) {
      console.error('Fallback download failed:', fallbackError);
      
      // Final fallback: Open in new tab with instructions
      try {
        window.open(documentUrl, '_blank');
        message.info('Document opened in new tab. Right-click and select "Save as" to download.');
        onCancel();
      } catch (finalError) {
        console.error('All download methods failed:', finalError);
        message.error('Unable to download document. Please check the URL or try again.');
      }
    }
  };

  const handleView = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: 'var(--brand-primary)' }} />
          <span>{isImage ? 'Profile Image Information' : 'Document Information'}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isImage ? 600 : 500}
      centered
    >
      {hasDocument ? (
        <div className="space-y-3">
          <Alert
            message={isImage ? "Profile Image Available" : "Document Available"}
            description={isImage ? "This profile image can be viewed and downloaded." : "This document is ready for download."}
            type="success"
            showIcon
          />
          
          {isImage && (
            <div className="flex justify-center">
              <img 
                src={documentUrl} 
                alt={fileName || 'Profile Image'} 
                className="max-w-full max-h-40 object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <FileTextOutlined style={{ fontSize: '20px', color: 'var(--brand-primary)' }} />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {isImage ? 'Image Details' : 'Document Details'}
                </Title>
              </div>
            </div>
            
            <div className="space-y-1 pl-8">
              {fileName && (
                <div className="flex justify-between">
                  <Text strong>File Name:</Text>
                  <Text>{fileName}</Text>
                </div>
              )}
              
              {documentType && (
                <div className="flex justify-between">
                  <Text strong>Type:</Text>
                  <Text>{documentType}</Text>
                </div>
              )}
              
              {fileSize && (
                <div className="flex justify-between">
                  <Text strong>Size:</Text>
                  <Text>{fileSize}</Text>
                </div>
              )}
              
              {uploadDate && (
                <div className="flex justify-between">
                  <Text strong>Upload Date:</Text>
                  <Text>{moment(uploadDate).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button onClick={onCancel}>
              Cancel
            </Button>
            {isImage && (
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={handleView}
              >
                View Image
              </Button>
            )}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{ backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' }}
            >
              {isImage ? 'Download Image' : 'Download Document'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            <div className="mt-2 text-gray-600 font-medium text-center">
              {isImage ? 'No profile image found' : 'No document found'}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onCancel}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DocumentInfoModal;
