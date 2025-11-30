import { Upload, UploadFile } from 'antd'
import React, { useState, useEffect } from 'react'
import { VideoCameraOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { apiUrls } from '../apis';
import usePostQuery from '../hooks/postQuery.hook';

interface UploadMediaProps {
    isVideo?: boolean;
    value?: string;
    onChange: (value: string) => void
}

const UploadMedia = ({
    isVideo = false,
    value,
    onChange
}: UploadMediaProps) => {
    const { postQuery, loading } = usePostQuery()
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Update fileList when value changes (for edit mode)
    useEffect(() => {
        if (value && value.trim() !== "") {
            setFileList([
                {
                    uid: "-1",
                    name: "existing-media",
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

        const base64String = await handleBase64String(fileList);

        if (fileList[0].type?.startsWith('video/mp4')) {
            postQuery({
                url: apiUrls.uploadMedia,
                onSuccess: (res: any) => onChange(res?.data),
                postData: { base64String, fileType: 'video' }
            })
        } else {
            postQuery({
                url: apiUrls.uploadMedia,
                onSuccess: (res: any) => onChange(res?.data),
                postData: { base64String }
            })
        }
    }
    return (<>
        {
            isVideo ? (
                <div>
                    <Upload.Dragger
                        fileList={fileList}
                        style={{ border: '1px dotted #274699' }}
                        onChange={({ fileList }) => handleItemChange(fileList)}
                        maxCount={1}
                        accept="video/*"
                        listType="picture-card"
                    >
                        {fileList.length >= 1 ? null : (
                            <div className="flex flex-col text-[#274699] items-center justify-center h-24">
                                <VideoCameraOutlined style={{ fontSize: '24px', color: '#274699' }} />
                                <p className="ant-upload-text mt-2 text-[#274699]">
                                    Upload Video
                                </p>
                            </div>
                        )}
                    </Upload.Dragger>
                    {value && (
                        <p className="text-xs text-gray-500 mt-2 break-all">
                            URL: <span className="text-blue-500">{value}</span>
                        </p>
                    )}
                </div>
            ) : (
                <div>
                    <Upload.Dragger
                        fileList={fileList}
                        style={{ border: '1px dotted #274699' }}
                        onChange={({ fileList }) => handleItemChange(fileList)}
                        maxCount={1}
                        accept="audio/*"
                        listType="picture-card"
                    >
                        {fileList.length >= 1 ? null : (
                            <div className="flex flex-col items-center justify-center h-24">
                                <CustomerServiceOutlined style={{ fontSize: '24px', color: '#274699' }} />
                                <p className="ant-upload-text mt-2 text-[#274699]">
                                    Upload Audio
                                </p>
                            </div>
                        )}
                    </Upload.Dragger>
                    {value && (
                        <p className="text-xs text-gray-500 mt-2 break-all">
                            URL: <span className="text-blue-500">{value}</span>
                        </p>
                    )}
                </div>
            )
        }</>

    )
}

export default UploadMedia;