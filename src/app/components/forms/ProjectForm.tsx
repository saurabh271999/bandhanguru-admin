// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Input, Select, Form, Button, Upload, DatePicker, message } from "antd";
// import {
//   PlusOutlined,
//   DeleteOutlined,
//   UploadOutlined,
//   SearchOutlined,
//   VideoCameraOutlined,
//   CustomerServiceOutlined,
// } from "@ant-design/icons";
// import type { UploadProps, GetProp } from "antd";
// import dayjs from "dayjs";
// import { apiBaseUrl, apiUrls } from "@/app/apis";
// import usePostQuery from "@/app/hooks/postQuery.hook";
// import usePutQuery from "@/app/hooks/putQuery.hook";
// import useGetQuery from "@/app/hooks/getQuery.hook";
// import toast from "react-hot-toast";

// const { TextArea } = Input;
// const { Option } = Select;

// type FileType = GetProp<UploadProps, "fileList">[number];

// // --- INTERFACES ---
// interface WindowItem {
//   name: string;
//   location: string;
//   floor?: string;
//   sillLevel?: string;
//   type: string;
//   width: string;
//   height: string;
//   note?: string;
//   image?: string;
// }

// interface MmsWindowItem {
//   mmsNumber: string;
//   date: dayjs.Dayjs | null;
//   selectedWindows: string[];
//   fileList: FileType[];
// }

// interface BomItem {
//   mmsNumber: string;
//   fileList: FileType[];
// }

// interface ProductionItem {
//   mmsNumber: string;
//   fileList: FileType[];
// }

// interface ReadyToDispatchItem {
//   mmsNumber: string;
//   qualityReport: FileType[];
// }

// interface DispatchItem {
//   mmsNumber: string;
//   dispatchNumber: string;
//   billNumber: string;
//   dispatchFile: FileType[];
// }

// interface FixingTeamInfoItem {
//   dispatchNumber: string;
//   searchInstallers: string;
//   fixingStartDate: dayjs.Dayjs | null;
//   targetDate: dayjs.Dayjs | null;
// }

// interface InstallationCompleteItem {
//   dispatchNumber: string;
//   fixingStartDate: dayjs.Dayjs | null;
//   targetDate: dayjs.Dayjs | null;
//   completionDate: dayjs.Dayjs | null;
//   manpowerUsed: string;
//   preHandoverReport: FileType[];
//   clientHandoverReport: FileType[];
// }

// interface TestimonialItem {
//   clientAdminName: string;
//   clientFeedback: string;
//   videoUpload: FileType[];
//   audioUpload: FileType[];
// }

// interface RemarkItem {
//   remarkDate: dayjs.Dayjs | null;
//   Time: string;
//   remarkDescription: string;
// }

// interface FormData {
//   projectCode: string;
//   category: string;
//   title: string;
//   description: string;
//   projectDocuments: FileType[];
//   billingAddress: string;
//   shippingAddress: string;
//   currentStage: string;
//   warrantyPeriod: string;
//   remarks: RemarkItem[];
// }

// const initialFormData: FormData = {
//   projectCode: "",
//   category: "",
//   title: "",
//   description: "",
//   projectDocuments: [],
//   billingAddress: "",
//   shippingAddress: "",
//   currentStage: "",
//   warrantyPeriod: "",
//   remarks: [{ remarkDate: null, Time: "", remarkDescription: "" }],
// };

// interface ProjectFormProps {
//   mode?: "add" | "edit";
//   projectId?: string | null;
//   initialData?: any | null;
//   onSuccess?: ((res: any) => void) | null;
// }

// export default function ProjectForm({
//   mode = "add",
//   projectId = null,
//   initialData = null,
//   onSuccess = null,
// }: ProjectFormProps) {
//   const [installers, setInstallers] = useState<any[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [uploadingStates, setUploadingStates] = useState<
//     Record<string, boolean>
//   >({});
//   const [siteSurveyData, setSiteSurveyData] = useState<any[]>([]);
// const [loadingSiteSurvey, setLoadingSiteSurvey] = useState<boolean>(false);

//   const { postQuery, loading: postLoading } = usePostQuery();
//   const { putQuery, loading: putLoading } = usePutQuery();
//   const { getQuery } = useGetQuery();
//   const router = useRouter();

//   const [formData, setFormData] = useState<FormData>(initialFormData);
//   const [errors, setErrors] = useState<Record<string, string>>({});

// //Site survey

// // Add this useEffect after your existing useEffect for fetching installers (around line 210)
// // useEffect(() => {
// //   const fetchSiteSurveyData = async (siteId) => {
// //     setLoadingSiteSurvey(true);
// //     try {
// //       await getQuery({
// //           url: `${apiUrls.createSite}/${siteId}`, // Replace with your actual API endpoint
// //         onSuccess: (response: any) => {
// //           // Handle the response based on your API structure
// //           const data = response.data || response.siteSurvey || response;
// //           setSiteSurveyData(data);

// //           // If you want to populate the siteSurveyWindows state with fetched data
// //           if (data && data.length > 0) {
// //             setSiteSurveyWindows(data.map((item: any) => ({
// //               name: item.siteName || item.name || "",
// //               location: item.siteLocation || item.location || "",
// //               floor: item.siteFloor || item.floor || "",
// //               sillLevel: item.siteSillLevel || item.sillLevel || "",
// //               type: item.siteType || item.type || "",
// //               width: item.siteWidth || item.width || "",
// //               height: item.siteHeight || item.height || "",
// //               note: item.siteStatus || item.note || item.status || "",
// //               image: item.siteImage || item.image || "",
// //             })));
// //           }
// //           setLoadingSiteSurvey(false);
// //         },
// //         onFail: (error: any) => {
// //           console.error("Error fetching site survey data:", error);
// //           toast.error("Failed to fetch site survey data");
// //           setLoadingSiteSurvey(false);
// //         },
// //       });
// //     } catch (err: any) {
// //       console.error("Error fetching site survey data:", err);
// //       toast.error("Failed to fetch site survey data");
// //       setLoadingSiteSurvey(false);
// //     }
// //   };

// //   fetchSiteSurveyData();
// // }, [getQuery]);

//   useEffect(() => {
//     const fetchInstallers = async () => {
//       try {
//         await getQuery({
//           url: apiUrls.getAllInstallers,
//           onSuccess: (response: any) => {
//             setInstallers(response.installers || response.data || []);
//           },
//           onFail: (error: any) => {
//             console.error("Error fetching installers:", error);
//           },
//         });
//       } catch (err: any) {
//         console.error("Error fetching installers:", err);
//       }
//     };

//     fetchInstallers();
//   }, [getQuery]);

//   // Initialize form data based on mode
//   useEffect(() => {
//     if (mode === "edit" && initialData) {
//       setFormData(initialData);
//     } else if (mode === "edit" && projectId) {
//       fetchProjectData();
//     }
//   }, [mode, projectId, initialData]);

//   // Fetch project data by ID (for edit mode)
//   const fetchProjectData = () => {
//     if (!projectId) {
//       toast.error("Project ID is required");
//       return;
//     }

//     getQuery({
//       url: `${apiUrls.getProjectById}/${projectId}`,
//       onSuccess: (response: any) => {
//         const projectData = response?.data || response?.project || response;
//         if (projectData) {
//           setFormData(projectData);
//           // Set individual stage data
//           setSiteSurveyWindows(
//             projectData.site || [
//               { name: "", location: "", type: "", width: "", height: "" },
//             ]
//           );
//           setMmsWindows(
//             projectData.mms || [
//               { mmsNumber: "", date: null, selectedWindows: [], fileList: [] },
//             ]
//           );
//           setBomItems(projectData.bom || [{ mmsNumber: "", fileList: [] }]);
//           setProductionItems(
//             projectData.production || [{ mmsNumber: "", fileList: [] }]
//           );
//           setReadyToDispatchItems(
//             projectData.readyToDispatch || [
//               { mmsNumber: "", qualityReport: [] },
//             ]
//           );
//           setDispatchItems(
//             projectData.dispatch || [
//               {
//                 mmsNumber: "",
//                 dispatchNumber: "",
//                 billNumber: "",
//                 dispatchFile: [],
//               },
//             ]
//           );
//           setFixingTeamInfoItems(
//             projectData.teamInfo || [
//               {
//                 dispatchNumber: "",
//                 searchInstallers: "",
//                 fixingStartDate: null,
//                 targetDate: null,
//               },
//             ]
//           );
//           setInstallationCompleteItems(
//             projectData.installationComplete || [
//               {
//                 dispatchNumber: "",
//                 fixingStartDate: null,
//                 targetDate: null,
//                 completionDate: null,
//                 manpowerUsed: "",
//                 preHandoverReport: [],
//                 clientHandoverReport: [],
//               },
//             ]
//           );
//           setTestimonialItems(
//             projectData.testimonial || [
//               {
//                 clientAdminName: "",
//                 clientFeedback: "",
//                 videoUpload: [],
//                 audioUpload: [],
//               },
//             ]
//           );
//         }
//       },
//       onFail: (err: any) => {
//         toast.error("Failed to fetch project details");
//       },
//     });
//   };

//   // Convert file to base64
//   const toBase64 = (file: File): Promise<string> =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });

//   // Set individual upload loading state
//   const setUploadLoading = (uploadId: string, loading: boolean) => {
//     setUploadingStates((prev) => ({
//       ...prev,
//       [uploadId]: loading,
//     }));
//   };

//   // Get individual upload loading state
//   const getUploadLoading = (uploadId: string) => {
//     return uploadingStates[uploadId] || false;
//   };

//   // Handle file upload based on file type
//   const handleFileUpload = async (
//     file: File,
//     uploadId: string
//   ): Promise<string> => {
//     setUploadLoading(uploadId, true);
//     try {
//       let uploadUrl = "";
//       let base64String = await toBase64(file);

//       if (base64String.includes(",")) {
//         base64String = base64String.split(",")[1];
//       }

//       // Choose upload endpoint based on file type
//       if (file.type.startsWith("application/pdf")) {
//         uploadUrl = apiUrls.uploadPdf;
//       } else if (file.type.startsWith("image/")) {
//         uploadUrl = apiUrls.uploadImage;
//       } else if (
//         file.type.startsWith("video/") ||
//         file.type.startsWith("audio/")
//       ) {
//         uploadUrl = apiUrls.uploadMedia;
//       } else {
//         throw new Error("Only PDF, image, video, or audio files are allowed");
//       }

//       return new Promise((resolve, reject) => {
//         postQuery({
//           url: uploadUrl,
//           postData: { base64String },
//           headers: { "Content-Type": "application/json" },
//           skipToast: true,
//           onSuccess: (uploadRes: any) => {
//             const uploadedUrl =
//               uploadRes?.data || uploadRes?.fileUrl || uploadRes?.url || "";
//             if (!uploadedUrl) {
//               toast.error("File uploaded but URL not returned");
//               setUploadLoading(uploadId, false);
//               return reject(new Error("Upload URL not returned"));
//             }
//             setUploadLoading(uploadId, false);
//             resolve(uploadedUrl);
//           },
//           onFail: (err: any) => {
//             console.error("File upload error:", err);
//             toast.error("Failed to upload file");
//             setUploadLoading(uploadId, false);
//             reject(err);
//           },
//         });
//       });
//     } catch (error) {
//       setUploadLoading(uploadId, false);
//       throw error;
//     }
//   };

//   // Handle custom upload for different file types
//   const handleCustomUpload = async (
//     file: File,
//     uploadId: string,
//     fileType: "pdf" | "image" | "media" = "image"
//   ): Promise<any> => {
//     try {
//       const uploadedUrl = await handleFileUpload(file, uploadId);

//       // Return a file object that Ant Design Upload can understand
//       return {
//         uid: Date.now().toString(),
//         name: file.name,
//         status: "done",
//         url: uploadedUrl,
//         response: { url: uploadedUrl },
//       };
//     } catch (error) {
//       console.error("Upload failed:", error);
//       return {
//         uid: Date.now().toString(),
//         name: file.name,
//         status: "error",
//         error: error,
//       };
//     }
//   };

//   // Custom upload request handler
//   const customUploadRequest = (
//     options: any,
//     uploadId: string,
//     fileType: "pdf" | "image" | "media" = "image"
//   ) => {
//     const { file, onSuccess, onError } = options;

//     handleFileUpload(file, uploadId)
//       .then((url) => {
//         // Create a proper file object with the URL
//         const fileObj = {
//           uid: Date.now().toString(),
//           name: file.name,
//           status: "done",
//           url: url,
//           response: { url },
//         };
//         onSuccess(fileObj, file);
//       })
//       .catch((error) => {
//         onError(error);
//       });
//   };

//   const validate = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     Object.entries(formData).forEach(([key, value]) => {
//       const optionalFields = ["remarks", "projectDocuments"];
//       if (optionalFields.includes(key)) return;

//       if (!value) newErrors[key] = "This field is required";
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (name: keyof FormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleRemarkChange = (
//     remarkIndex: number,
//     name: keyof RemarkItem,
//     value: any
//   ) => {
//     setFormData((prev) => {
//       const newRemarks = [...prev.remarks];
//       newRemarks[remarkIndex] = { ...newRemarks[remarkIndex], [name]: value };
//       return { ...prev, remarks: newRemarks };
//     });
//   };

//   const addRemark = () => {
//     setFormData((prev) => ({
//       ...prev,
//       remarks: [
//         ...prev.remarks,
//         { remarkDate: null, Time: "", remarkDescription: "" },
//       ],
//     }));
//   };

//   const removeRemark = (remarkIndex: number) => {
//     setFormData((prev) => {
//       if (prev.remarks.length > 1) {
//         const newRemarks = prev.remarks.filter((_, i) => i !== remarkIndex);
//         return { ...prev, remarks: newRemarks };
//       }
//       return prev;
//     });
//   };

//   // Helper function to extract file URL from upload object
//   const getFileUrl = (fileList: FileType[]): string => {
//     if (fileList && fileList.length > 0) {
//       const file = fileList[0];
//       return file.url || file.response?.url || "";
//     }
//     return "";
//   };

//   const handleSubmit = async () => {
//     if (!validate()) {
//       toast.error("Please fill the form correctly before submitting");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Prepare the project data according to the schema
//       const projectData = {
//         projectCode: formData.projectCode,
//         category: formData.category,
//         title: formData.title,
//         description: formData.description,
//         billingAddress: formData.billingAddress,
//         shippingAddress: formData.shippingAddress,
//         projectCurrentStage: formData.currentStage,
//         warrantyPeriod: formData.warrantyPeriod,
//         remark: formData.remarks.map((remark) => ({
//           remarkDate: remark.remarkDate ? remark.remarkDate.toDate() : null,
//           remarkTime: remark.Time,
//           remarkDescription: remark.remarkDescription,
//         })),
//         softDataDocument: getFileUrl(formData.projectDocuments),
//         site: siteSurveyWindows.map((site) => ({
//           siteName: site.name,
//           siteLocation: site.location,
//           siteFloor: site.floor || "",
//           siteSillLevel: site.sillLevel || "",
//           siteType: site.type,
//           siteSize: `${site.width}x${site.height}`,
//           siteStatus: site.note || "",
//           siteImage: site.image || "",
//         })),
//         bom: bomItems.map((bom) => ({
//           mmsNumber: bom.mmsNumber,
//           bomDocument: getFileUrl(bom.fileList),
//         })),
//         production: productionItems.map((prod) => ({
//           mmsNumber: prod.mmsNumber,
//           productionDocument: getFileUrl(prod.fileList),
//         })),
//         readyToDispatch: readyToDispatchItems.map((dispatch) => ({
//           mmsNumber: dispatch.mmsNumber,
//           preDispatchDocument: getFileUrl(dispatch.qualityReport),
//         })),
//         dispatch: dispatchItems.map((dispatch) => ({
//           mmsNumber: dispatch.mmsNumber,
//           dispatchNumber: dispatch.dispatchNumber,
//           billNumber: dispatch.billNumber,
//           dispatchDocument: getFileUrl(dispatch.dispatchFile),
//         })),
//         teamInfo: fixingTeamInfoItems.map((team) => ({
//           dispatchNumber: team.dispatchNumber,
//           selectInstallers: team.searchInstallers,
//           teamMemberContact: "", // You might want to add this field
//           fixingStartDate: team.fixingStartDate
//             ? team.fixingStartDate.toDate()
//             : null,
//           targetDate: team.targetDate ? team.targetDate.toDate() : null,
//         })),
//         installationComplete: installationCompleteItems.map((install) => ({
//           dispatchNumber: install.dispatchNumber,
//           fixingStartDate: install.fixingStartDate
//             ? install.fixingStartDate.toDate()
//             : null,
//           targetDate: install.targetDate ? install.targetDate.toDate() : null,
//           completionDate: install.completionDate
//             ? install.completionDate.toDate()
//             : null,
//           manpowerUsed: install.manpowerUsed,
//           preHandoverDocument: getFileUrl(install.preHandoverReport),
//           clientHandover: getFileUrl(install.clientHandoverReport),
//         })),
//         testimonial: testimonialItems.map((test) => ({
//           clientName: test.clientAdminName,
//           clientFeedback: test.clientFeedback,
//           testimonialVideo: getFileUrl(test.videoUpload),
//           testimonialAudio: getFileUrl(test.audioUpload),
//         })),
//       };

//       if (mode === "add") {
//         // Create new project
//         await postQuery({
//           url: apiUrls.createProject,
//           postData: projectData,
//           onSuccess: (res: any) => {
//             toast.success("Project created successfully!");
//             if (onSuccess) {
//               onSuccess(res);
//             } else {
//               router.push("/dashboard/projectmanagement");
//             }
//             setIsSubmitting(false);
//           },
//           onFail: (err: any) => {
//             console.error("Project creation error:", err);
//             toast.error(
//               err?.response?.data?.message ||
//                 "Failed to create project. Please try again."
//             );
//             setIsSubmitting(false);
//           },
//         });
//       } else {
//         // Update existing project
//         await putQuery({
//           url: `${apiUrls.updateProject}/${projectId}`,
//           putData: projectData,
//           onSuccess: (res: any) => {
//             toast.success("Project updated successfully!");
//             if (onSuccess) {
//               onSuccess(res);
//             } else {
//               router.push("/dashboard/projectmanagement");
//             }
//             setIsSubmitting(false);
//           },
//           onFail: (err: any) => {
//             console.error("Project update error:", err);
//             toast.error(
//               err?.response?.data?.message ||
//                 "Failed to update project. Please try again."
//             );
//             setIsSubmitting(false);
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error("An error occurred while submitting the form");
//       setIsSubmitting(false);
//     }
//   };

//   // --- All other state and handlers remain unchanged ---
//   const [siteSurveyWindows, setSiteSurveyWindows] = useState<WindowItem[]>([
//     {
//       name: "Window A",
//       location: "Bedroom",
//       type: "Fixed",
//       width: "1200",
//       height: "1500",
//     },
//   ]);
//   const [mmsWindows, setMmsWindows] = useState<MmsWindowItem[]>([
//     { mmsNumber: "", date: null, selectedWindows: [], fileList: [] },
//   ]);
//   const [bomItems, setBomItems] = useState<BomItem[]>([
//     { mmsNumber: "", fileList: [] },
//   ]);
//   const [productionItems, setProductionItems] = useState<ProductionItem[]>([
//     { mmsNumber: "", fileList: [] },
//   ]);
//   const [readyToDispatchItems, setReadyToDispatchItems] = useState<
//     ReadyToDispatchItem[]
//   >([{ mmsNumber: "", qualityReport: [] }]);
//   const [dispatchItems, setDispatchItems] = useState<DispatchItem[]>([
//     { mmsNumber: "", dispatchNumber: "", billNumber: "", dispatchFile: [] },
//   ]);
//   const [fixingTeamInfoItems, setFixingTeamInfoItems] = useState<
//     FixingTeamInfoItem[]
//   >([
//     {
//       dispatchNumber: "",
//       searchInstallers: "",
//       fixingStartDate: null,
//       targetDate: null,
//     },
//   ]);
//   const [installationCompleteItems, setInstallationCompleteItems] = useState<
//     InstallationCompleteItem[]
//   >([
//     {
//       dispatchNumber: "",
//       fixingStartDate: null,
//       targetDate: null,
//       completionDate: null,
//       manpowerUsed: "",
//       preHandoverReport: [],
//       clientHandoverReport: [],
//     },
//   ]);
//   const [testimonialItems, setTestimonialItems] = useState<TestimonialItem[]>([
//     {
//       clientAdminName: "Supritha Iyer",
//       clientFeedback: "",
//       videoUpload: [],
//       audioUpload: [],
//     },
//   ]);

//   const handleWindowChange = (
//     stageType: any,
//     index: number,
//     field: any,
//     value: any
//   ) => {
//     const setters = {
//       siteSurvey: setSiteSurveyWindows,
//       mms: setMmsWindows,
//       bom: setBomItems,
//       production: setProductionItems,
//       readyToDispatch: setReadyToDispatchItems,
//       dispatch: setDispatchItems,
//       fixingTeamInfo: setFixingTeamInfoItems,
//       installationComplete: setInstallationCompleteItems,
//       testimonial: setTestimonialItems,
//     };

//     const setter = setters[stageType as keyof typeof setters];
//     if (setter) {
//       setter((prevItems: any) => {
//         const newItems = [...prevItems];
//         (newItems[index] as any)[field] = value;
//         return newItems;
//       });
//     }
//   };

//   const addItem = (
//     setItemsFunc: React.Dispatch<React.SetStateAction<any[]>>,
//     initialItem: any
//   ) => {
//     setItemsFunc((prevItems) => [...prevItems, initialItem]);
//   };

//   const removeItem = (
//     index: number,
//     setItemsFunc: React.Dispatch<React.SetStateAction<any[]>>
//   ) => {
//     setItemsFunc((prevItems) => prevItems.filter((_, i) => i !== index));
//   };

//   const getWindowOptions = () =>
//     siteSurveyWindows.map((window) => ({
//       label: `${window.name} (${window.location})`,
//       value: window.name,
//     }));
//   const getMmsNumberOptions = () =>
//     mmsWindows
//       .map((mms) => ({ label: mms.mmsNumber, value: mms.mmsNumber }))
//       .filter((option) => option.value);
//   const getDispatchNumberOptions = () =>
//     dispatchItems
//       .map((d) => ({ label: d.dispatchNumber, value: d.dispatchNumber }))
//       .filter((option) => option.value);
//   const getManpowerOptions = () => [
//     { label: "1 Person", value: "1" },
//     { label: "2 Persons", value: "2" },
//     { label: "3 Persons", value: "3" },
//     { label: "4+ Persons", value: "4+" },
//   ];

//   const renderSection = (
//     itemsArray: any[],
//     setItemsFunc: React.Dispatch<React.SetStateAction<any[]>>,
//     stageType: any,
//     showControls: boolean = true
//   ) => (
//     <>
//       {itemsArray.map((item: any, index: number) => (
//         <div
//           key={`${stageType}-${index}`}
//           className="mb-6 pb-4 last:mb-0 last:pb-0"
//         >
//           {stageType === "siteSurvey" && (
//             <p className="text-[#8BBB33] font-semibold mb-2">
//               Site {index + 1}
//             </p>
//           )}

//           {stageType !== "testimonial" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {stageType === "siteSurvey" && (
//                 <>
//                   <Form.Item>
//                     <label className="block mb-1 font-semibold">Name</label>
//                     <Input
//                       value={item.name}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "name",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item>
//                     <label className="block mb-1 font-semibold">Location</label>
//                     <Input
//                       value={item.location}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "location",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item>
//                     <label className="block mb-1 font-semibold">Floor</label>
//                     <Input
//                       value={item.floor}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "Floor",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item>
//                     <label className="block mb-1 font-semibold">
//                       Sill Level
//                     </label>
//                     <Input
//                       value={item.sillLevel}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "sill level",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">Type</label>
//                     <Select
//                       placeholder="Select type"
//                       value={item.type}
//                       onChange={(value) =>
//                         handleWindowChange(stageType, index, "type", value)
//                       }
//                     >
//                       <Option value="Fixed">Fixed</Option>
//                       <Option value="Sliding">Sliding</Option>
//                       <Option value="Casement">Casement</Option>
//                     </Select>
//                   </Form.Item>
//                   <div className="flex flex-col gap-1">
//                     <label className="block mb-1 font-semibold text-black text-[13px]">
//                       Size in (mm)
//                     </label>
//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <Input
//                         placeholder="W"
//                         size="small"
//                         className="!h-8"
//                         value={item.width}
//                         onChange={(e) =>
//                           handleWindowChange(
//                             stageType,
//                             index,
//                             "width",
//                             e.target.value
//                           )
//                         }
//                       />
//                       <Input
//                         placeholder="H"
//                         size="small"
//                         className="!h-8"
//                         value={item.height}
//                         onChange={(e) =>
//                           handleWindowChange(
//                             stageType,
//                             index,
//                             "height",
//                             e.target.value
//                           )
//                         }
//                       />
//                     </div>
//                   </div>

//                   <Form.Item
//                     style={{ width: "100%", fontWeight: "700" }}
//                     className="col-span-2 text-black font-semibold"
//                   >
//                     <Select
//                       className="font-bold"
//                       placeholder="Select note"
//                       value={item.note}
//                       onChange={(value) =>
//                         handleWindowChange(stageType, index, "note", value)
//                       }
//                       style={{
//                         width: "100%",
//                         display: "flex",
//                         justifyContent: "start",
//                         fontWeight: "700",
//                       }}
//                     >
//                       <Option value="Pending">Pending</Option>
//                       <Option value="In Progress">In Progress</Option>
//                       <Option value="Ready to Measure">Ready to Measure</Option>
//                     </Select>
//                   </Form.Item>

//                   <div className="col-span-2">
//                     <label htmlFor="" className="text-black font-bold">
//                       Site ( Before Work Image)
//                       <Upload
//                         fileList={formData.projectDocuments}
//                         customRequest={(options) =>
//                           customUploadRequest(options, "site-image", "image")
//                         }
//                         onChange={({ fileList }) =>
//                           handleChange("projectDocuments", fileList)
//                         }
//                         style={{ height: "180px", width: "100%" }}
//                         accept="image/*"
//                       >
//                         <Button
//                           icon={<UploadOutlined />}
//                           style={{
//                             height: "100%",
//                             width: "100%",
//                             color: "#274699",
//                             fontWeight: "500",
//                             fontSize: "16px",
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             border: "1px solid #C0C0C0",
//                           }}
//                           loading={getUploadLoading("site-image")}
//                         >
//                           Upload here
//                         </Button>
//                       </Upload>
//                     </label>
//                   </div>
//                 </>
//               )}

//               {stageType === "mms" && (
//                 <>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       MMS Number
//                     </label>
//                     <Input
//                       value={item.mmsNumber}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "mmsNumber",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">Date</label>
//                     <DatePicker
//                       value={item.date}
//                       onChange={(date) =>
//                         handleWindowChange(stageType, index, "date", date)
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Selected Windows
//                     </label>
//                     <Select
//                       mode="multiple"
//                       placeholder="Select windows"
//                       value={item.selectedWindows}
//                       onChange={(value) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "selectedWindows",
//                           value
//                         )
//                       }
//                       options={getWindowOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Upload Document
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.fileList}
//                       customRequest={(options) =>
//                         customUploadRequest(options, `mms-${index}`, "pdf")
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "fileList",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         style={{ width: "100%" }}
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`mms-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}

//               {(stageType === "bom" || stageType === "production") && (
//                 <>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       MMS Number
//                     </label>
//                     <Select
//                       placeholder="Select MMS Number"
//                       value={item.mmsNumber}
//                       onChange={(value) =>
//                         handleWindowChange(stageType, index, "mmsNumber", value)
//                       }
//                       options={getMmsNumberOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Upload Document
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.fileList}
//                       customRequest={(options) =>
//                         customUploadRequest(
//                           options,
//                           `${stageType}-${index}`,
//                           "pdf"
//                         )
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "fileList",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`${stageType}-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}

//               {stageType === "readyToDispatch" && (
//                 <>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       MMS Number
//                     </label>
//                     <Select
//                       placeholder="Select MMS Number"
//                       value={item.mmsNumber}
//                       onChange={(value) =>
//                         handleWindowChange(stageType, index, "mmsNumber", value)
//                       }
//                       options={getMmsNumberOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Add Pre-Dispatch Quality Report
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.qualityReport}
//                       customRequest={(options) =>
//                         customUploadRequest(options, `quality-${index}`, "pdf")
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "qualityReport",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`quality-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}

//               {stageType === "dispatch" && (
//                 <>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       MMS Number
//                     </label>
//                     <Select
//                       placeholder="Select MMS Number"
//                       value={item.mmsNumber}
//                       onChange={(value) =>
//                         handleWindowChange(stageType, index, "mmsNumber", value)
//                       }
//                       options={getMmsNumberOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       Dispatch Number
//                     </label>
//                     <Input
//                       value={item.dispatchNumber}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "dispatchNumber",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       Bill Number
//                     </label>
//                     <Input
//                       value={item.billNumber}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "billNumber",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Upload Dispatch File
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.dispatchFile}
//                       customRequest={(options) =>
//                         customUploadRequest(options, `dispatch-${index}`, "pdf")
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "dispatchFile",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`dispatch-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}

//               {stageType === "fixingTeamInfo" && (
//                 <>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Dispatch Number
//                     </label>
//                     <Select
//                       placeholder="Select Dispatch Number"
//                       value={item.dispatchNumber}
//                       onChange={(value) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "dispatchNumber",
//                           value
//                         )
//                       }
//                       options={getDispatchNumberOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Select Installers
//                     </label>
//                     <Select
//                       placeholder="Choose installer"
//                       value={item.searchInstallers}
//                       onChange={(value) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "searchInstallers",
//                           value
//                         )
//                       }
//                       style={{ width: "100%" }}
//                       showSearch
//                       optionFilterProp="children"
//                     >
//                       {installers.map((installer) => (
//                         <Option key={installer._id} value={installer.name}>
//                           {installer.name}
//                         </Option>
//                       ))}
//                     </Select>
//                     <Button
//                       className=" mt-2 "
//                       style={{
//                         backgroundColor: "#274699",
//                         color: "white",
//                         float: "right",
//                         width: "17%",
//                       }}
//                     >
//                       Notify
//                     </Button>
//                   </Form.Item>

//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Fixing Start Date
//                     </label>
//                     <DatePicker
//                       value={item.fixingStartDate}
//                       onChange={(date) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "fixingStartDate",
//                           date
//                         )
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Target Date
//                     </label>
//                     <DatePicker
//                       value={item.targetDate}
//                       onChange={(date) =>
//                         handleWindowChange(stageType, index, "targetDate", date)
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                 </>
//               )}

//               {stageType === "installationComplete" && (
//                 <>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Dispatch Number
//                     </label>
//                     <Select
//                       placeholder="Select Dispatch Number"
//                       value={item.dispatchNumber}
//                       onChange={(value) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "dispatchNumber",
//                           value
//                         )
//                       }
//                       options={getDispatchNumberOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       Fixing Start Date
//                     </label>
//                     <DatePicker
//                       value={item.fixingStartDate}
//                       onChange={(date) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "fixingStartDate",
//                           date
//                         )
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       Target Date
//                     </label>
//                     <DatePicker
//                       value={item.targetDate}
//                       onChange={(date) =>
//                         handleWindowChange(stageType, index, "targetDate", date)
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       Completion Date
//                     </label>
//                     <DatePicker
//                       value={item.completionDate}
//                       onChange={(date) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "completionDate",
//                           date
//                         )
//                       }
//                       className="w-full"
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-1">
//                     <label className="block mb-1 font-semibold">
//                       No. Of Manpower Used
//                     </label>
//                     <Select
//                       placeholder="Select manpower"
//                       value={item.manpowerUsed}
//                       onChange={(value) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "manpowerUsed",
//                           value
//                         )
//                       }
//                       options={getManpowerOptions()}
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Upload Pre-Handover Report
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.preHandoverReport}
//                       customRequest={(options) =>
//                         customUploadRequest(
//                           options,
//                           `pre-handover-${index}`,
//                           "pdf"
//                         )
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "preHandoverReport",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`pre-handover-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                   <Form.Item className="col-span-2">
//                     <label className="block mb-1 font-semibold">
//                       Upload Client Handover Report
//                     </label>
//                     <Upload
//                       style={{ width: "100%" }}
//                       fileList={item.clientHandoverReport}
//                       customRequest={(options) =>
//                         customUploadRequest(
//                           options,
//                           `client-handover-${index}`,
//                           "pdf"
//                         )
//                       }
//                       onChange={({ fileList }) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "clientHandoverReport",
//                           fileList
//                         )
//                       }
//                       maxCount={1}
//                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         className="w-full"
//                         loading={getUploadLoading(`client-handover-${index}`)}
//                       >
//                         Click to Upload
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}
//             </div>
//           )}

//           {stageType === "testimonial" && (
//             <div className="shadow-lg rounded-lg border border-gray-200 overflow-hidden relative pb-10">
//               <div className="grid grid-cols-1 md:grid-cols-3">
//                 <div className="col-span-1 border-b md:border-b-0 md:border-r border-gray-200">
//                   <div className="p-2 font-semibold text-[#000088] bg-[#F2F2F2]">
//                     Name Of Client/Admin
//                   </div>
//                   <div className="flex items-center justify-center p-4 min-h-[250px]">
//                     <Input
//                       value={item.clientAdminName}
//                       onChange={(e) =>
//                         handleWindowChange(
//                           stageType,
//                           index,
//                           "clientAdminName",
//                           e.target.value
//                         )
//                       }
//                       placeholder="Client Name"
//                       bordered={false}
//                       className="text-center text-2xl font-semibold"
//                     />
//                   </div>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="p-2 font-semibold text-[#000088] bg-[#F2F2F2]">
//                     Reviews
//                   </div>
//                   <div className="p-4">
//                     <Form.Item className="mb-0">
//                       <label className="block mb-1 text-sm text-gray-600">
//                         Add Client Feedback
//                       </label>
//                       <TextArea
//                         value={item.clientFeedback}
//                         onChange={(e) =>
//                           handleWindowChange(
//                             stageType,
//                             index,
//                             "clientFeedback",
//                             e.target.value
//                           )
//                         }
//                         placeholder="Lorem ipsum dolor sit amet..."
//                         rows={4}
//                       />
//                     </Form.Item>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//                       <Form.Item className="mb-0">
//                         <label className="block mb-1 text-sm text-gray-600">
//                           Upload Video
//                         </label>
//                         <Upload.Dragger
//                           style={{ border: "1px dotted #274699" }}
//                           fileList={item.videoUpload}
//                           customRequest={(options) =>
//                             customUploadRequest(
//                               options,
//                               `video-${index}`,
//                               "media"
//                             )
//                           }
//                           onChange={({ fileList }) =>
//                             handleWindowChange(
//                               stageType,
//                               index,
//                               "videoUpload",
//                               fileList
//                             )
//                           }
//                           maxCount={1}
//                           accept="video/*"
//                         >
//                           <div className="flex flex-col text-[#274699] items-center justify-center h-24">
//                             <VideoCameraOutlined
//                               style={{ fontSize: "24px", color: "#274699" }}
//                             />
//                             <p className="ant-upload-text mt-2 text-[#274699]">
//                               {getUploadLoading(`video-${index}`)
//                                 ? "Uploading..."
//                                 : "Upload here"}
//                             </p>
//                           </div>
//                         </Upload.Dragger>
//                       </Form.Item>
//                       <Form.Item className="mb-0">
//                         <label className="block mb-1 text-sm text-gray-600">
//                           Upload Audio
//                         </label>
//                         <Upload.Dragger
//                           style={{ border: "1px dotted #274699" }}
//                           fileList={item.audioUpload}
//                           customRequest={(options) =>
//                             customUploadRequest(
//                               options,
//                               `audio-${index}`,
//                               "media"
//                             )
//                           }
//                           onChange={({ fileList }) =>
//                             handleWindowChange(
//                               stageType,
//                               index,
//                               "audioUpload",
//                               fileList
//                             )
//                           }
//                           maxCount={1}
//                           accept="audio/*"
//                         >
//                           <div className="flex flex-col items-center justify-center h-24">
//                             <CustomerServiceOutlined
//                               style={{ fontSize: "24px", color: "#274699 " }}
//                             />
//                             <p className="ant-upload-text mt-2 text-[#274699]">
//                               {getUploadLoading(`audio-${index}`)
//                                 ? "Uploading..."
//                                 : "Upload here"}
//                             </p>
//                           </div>
//                         </Upload.Dragger>
//                       </Form.Item>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="absolute bottom-4 right-4 flex flex-col sm:flex-row gap-2">
//                 {itemsArray.length > 1 && (
//                   <Button
//                     danger
//                     icon={<DeleteOutlined />}
//                     onClick={() => removeItem(index, setItemsFunc)}
//                   >
//                     Remove
//                   </Button>
//                 )}
//                 {index === itemsArray.length - 1 && (
//                   <Button
//                     style={{
//                       backgroundColor: "#E6F9C3",
//                       color: "#8BBB33",
//                       border: "none",
//                     }}
//                     icon={<PlusOutlined />}
//                     onClick={() =>
//                       addItem(setItemsFunc, {
//                         clientAdminName: "",
//                         clientFeedback: "",
//                         videoUpload: [],
//                         audioUpload: [],
//                       })
//                     }
//                   >
//                     Add More Testimonial
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )}

//           {showControls &&
//             stageType === "siteSurvey" &&
//             itemsArray.length > 1 && (
//               <Button
//                 danger
//                 icon={<DeleteOutlined />}
//                 onClick={() => removeItem(index, setItemsFunc)}
//                 className="mt-2"
//               >
//                 Remove
//               </Button>
//             )}

//           {!showControls &&
//             stageType !== "testimonial" &&
//             (stageType === "mms" ||
//               stageType === "bom" ||
//               stageType === "production" ||
//               stageType === "readyToDispatch" ||
//               stageType === "dispatch" ||
//               stageType === "fixingTeamInfo" ||
//               stageType === "installationComplete") && (
//               <div className="flex justify-end mt-2">
//                 {itemsArray.length > 1 && (
//                   <Button
//                     danger
//                     icon={<DeleteOutlined />}
//                     onClick={() => removeItem(index, setItemsFunc)}
//                     className="mr-2"
//                   >
//                     Remove
//                   </Button>
//                 )}
//                 {index === itemsArray.length - 1 && (
//                   <Button
//                     style={{
//                       backgroundColor: "#E6F9C3",
//                       color: "#8BBB33",
//                       border: "none",
//                     }}
//                     icon={<PlusOutlined />}
//                     onClick={() => {
//                       if (stageType === "mms")
//                         addItem(setItemsFunc, {
//                           mmsNumber: "",
//                           date: null,
//                           selectedWindows: [],
//                           fileList: [],
//                         });
//                       if (stageType === "bom")
//                         addItem(setItemsFunc, { mmsNumber: "", fileList: [] });
//                       if (stageType === "production")
//                         addItem(setItemsFunc, { mmsNumber: "", fileList: [] });
//                       if (stageType === "readyToDispatch")
//                         addItem(setItemsFunc, {
//                           mmsNumber: "",
//                           qualityReport: [],
//                         });
//                       if (stageType === "dispatch")
//                         addItem(setItemsFunc, {
//                           mmsNumber: "",
//                           dispatchNumber: "",
//                           billNumber: "",
//                           dispatchFile: [],
//                         });
//                       if (stageType === "fixingTeamInfo")
//                         addItem(setItemsFunc, {
//                           dispatchNumber: "",
//                           searchInstallers: "",
//                           fixingStartDate: null,
//                           targetDate: null,
//                         });
//                       if (stageType === "installationComplete")
//                         addItem(setItemsFunc, {
//                           dispatchNumber: "",
//                           fixingStartDate: null,
//                           targetDate: null,
//                           completionDate: null,
//                           manpowerUsed: "",
//                           preHandoverReport: [],
//                           clientHandoverReport: [],
//                         });
//                     }}
//                   >
//                     Add
//                   </Button>
//                 )}
//               </div>
//             )}
//         </div>
//       ))}

//       {showControls && stageType === "siteSurvey" && (
//         <Button
//           icon={<PlusOutlined />}
//           style={{
//             backgroundColor: "#E6F9C3",
//             color: "#8BBB33",
//             border: "none",
//           }}
//           onClick={() =>
//             addItem(setSiteSurveyWindows, {
//               name: "",
//               location: "",
//               type: "",
//               width: "",
//               height: "",
//             })
//           }
//         >
//           Add Window
//         </Button>
//       )}
//     </>
//   );

//   return (
//     <div className=" px-2 sm:px-4 md:px-6 lg:px-8 w-full mt-10 rounded-xl mx-auto">
//       <div className="shadow-lg mt-4 rounded bg-white">
//         <Form layout="vertical" onFinish={handleSubmit} className="shadow-lg">
//           <div className="grid p-5 grid-cols-1 md:grid-cols-2 gap-x-4">
//             <Form.Item
//               label="Project Code"
//               validateStatus={errors.projectCode ? "error" : ""}
//               help={errors.projectCode}
//               className="col-span-1"
//             >
//               <Input
//                 value={formData.projectCode}
//                 onChange={(e) => handleChange("projectCode", e.target.value)}
//                 placeholder="Enter project code"
//               />
//             </Form.Item>

//             <Form.Item
//               label="Category"
//               validateStatus={errors.category ? "error" : ""}
//               help={errors.category}
//               className="col-span-1"
//             >
//               <Select
//                 value={formData.category}
//                 onChange={(value) => handleChange("category", value)}
//                 placeholder="Select category"
//               >
//                 <Option value="Residential">Residential</Option>
//                 <Option value="Commercial">Commercial</Option>
//                 <Option value="Industrial">Project</Option>
//                 <Option value="Industrial">Flat Owner</Option>
//                 <Option value="Industrial">Facade</Option>
//                 <Option value="Industrial">Goverment</Option>
//               </Select>
//             </Form.Item>

//             <Form.Item
//               label="Title"
//               validateStatus={errors.title ? "error" : ""}
//               help={errors.title}
//               className="col-span-2"
//             >
//               <Input
//                 value={formData.title}
//                 onChange={(e) => handleChange("title", e.target.value)}
//                 placeholder="Enter title"
//               />
//             </Form.Item>

//             <Form.Item
//               label="Description"
//               validateStatus={errors.description ? "error" : ""}
//               help={errors.description}
//               className="col-span-2"
//             >
//               <TextArea
//                 value={formData.description}
//                 onChange={(e) => handleChange("description", e.target.value)}
//                 placeholder="Enter description"
//               />
//             </Form.Item>

//             <Form.Item
//               label="Billing Address"
//               validateStatus={errors.billingAddress ? "error" : ""}
//               help={errors.billingAddress}
//               className="col-span-1"
//             >
//               <TextArea
//                 value={formData.billingAddress}
//                 onChange={(e) => handleChange("billingAddress", e.target.value)}
//                 placeholder="Enter billing address"
//               />
//             </Form.Item>

//             <Form.Item
//               label="Shipping Address"
//               validateStatus={errors.shippingAddress ? "error" : ""}
//               help={errors.shippingAddress}
//               className="col-span-1"
//             >
//               <TextArea
//                 value={formData.shippingAddress}
//                 onChange={(e) =>
//                   handleChange("shippingAddress", e.target.value)
//                 }
//                 placeholder="Enter shipping address"
//               />
//             </Form.Item>

//             <div className="col-span-2 grid grid-cols-2 md:grid-cols-2 gap-x-4">
//               <Form.Item
//                 className="col-span-2"
//                 label="Project Current Stage"
//                 validateStatus={errors.currentStage ? "error" : ""}
//                 help={errors.currentStage}
//               >
//                 <Select
//                   value={formData.currentStage}
//                   onChange={(value) => handleChange("currentStage", value)}
//                   placeholder="Select current stage"
//                 >
//                   <Option value="Pending">Pending</Option>
//                   <Option value="In Progress">In Progress</Option>
//                   <Option value="Completed">Completed</Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 className="col-span-2"
//                 label="Proudct Type"
//                 validateStatus={errors.currentStage ? "error" : ""}
//                 help={errors.currentStage}
//               >
//                 <Select
//                   value={formData.currentStage}
//                   onChange={(value) => handleChange("currentStage", value)}
//                   placeholder="Select the option"
//                 >
//                   <Option value="Pending">Hardware</Option>
//                   <Option value="In Progress">Glass</Option>
//                   <Option value="Completed">Profiles</Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 className="col-span-2"
//                 label="Project Warranty Period"
//                 validateStatus={errors.warrantyPeriod ? "error" : ""}
//                 help={errors.warrantyPeriod}
//               >
//                 <Input
//                   value={formData.warrantyPeriod}
//                   onChange={(e) =>
//                     handleChange("warrantyPeriod", e.target.value)
//                   }
//                   placeholder="e.g. 12 months"
//                 />
//               </Form.Item>
//             </div>

//             <div className="col-span-2 space-y-4">
//               {formData.remarks.map((remark, remarkIndex) => (
//                 <div key={remarkIndex} className="p-4 rounded-md ">
//                   <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#D0D0D0]">
//                     <p className="font-semibold text-lg">
//                       Remark {remarkIndex + 1}
//                     </p>
//                     {formData.remarks.length > 1 && (
//                       <Button
//                         danger
//                         icon={<DeleteOutlined />}
//                         onClick={() => removeRemark(remarkIndex)}
//                       >
//                         Remove
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
//                     <Form.Item label="Date">
//                       <DatePicker
//                         value={remark.remarkDate}
//                         onChange={(date) =>
//                           handleRemarkChange(remarkIndex, "remarkDate", date)
//                         }
//                         className="w-full"
//                         showTime
//                       />
//                     </Form.Item>
//                     <Form.Item className="col-span-1" label="Time">
//                       <Input
//                         value={remark.Time}
//                         onChange={(e) =>
//                           handleRemarkChange(
//                             remarkIndex,
//                             "Time",
//                             e.target.value
//                           )
//                         }
//                       />
//                     </Form.Item>
//                   </div>
//                   <Form.Item label="Description" className="mt-4">
//                     <TextArea
//                       value={remark.remarkDescription}
//                       onChange={(e) =>
//                         handleRemarkChange(
//                           remarkIndex,
//                           "remarkDescription",
//                           e.target.value
//                         )
//                       }
//                       placeholder="Enter remark description"
//                       rows={3}
//                     />
//                   </Form.Item>
//                 </div>
//               ))}
//               <div className="flex justify-end">
//                 <Button
//                   icon={<PlusOutlined />}
//                   onClick={addRemark}
//                   style={{
//                     backgroundColor: "#E6F9C3",
//                     color: "#8BBB33",
//                     border: "none",
//                   }}
//                 >
//                   Add Remark
//                 </Button>
//               </div>
//             </div>
//           </div>
//           {/* <div className="p-5 flex justify-center md:justify-end">
//             <Button
//               type="primary"
//               htmlType="submit"
//               className="w-full md:w-auto"
//               style={{
//                 backgroundColor: "#274699",
//               }}
//             >
//               Save Project
//             </Button>
//           </div> */}
//         </Form>
//       </div>

//       <div>
//         <h1 className="text-black mt-10 ml-5 mb-5 font-semibold">
//           K-Soft Data
//         </h1>
//         <div
//           className="shadow-lg"
//           style={{
//             height: "200px",

//             borderRadius: "8px",
//             padding: "16px",
//           }}
//         >
//           <div style={{ height: "100%", width: "100%", margin: 0 }}>
//             <Upload
//               fileList={formData.projectDocuments}
//               customRequest={(options) =>
//                 customUploadRequest(options, "project-doc", "pdf")
//               }
//               onChange={({ fileList }) =>
//                 handleChange("projectDocuments", fileList)
//               }
//               style={{ height: "100%", width: "100%" }}
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//             >
//               <Button
//                 icon={<UploadOutlined />}
//                 style={{
//                   height: "100%",
//                   width: "100%",
//                   color: "#274699",
//                   fontWeight: "500",
//                   fontSize: "16px",
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   border: "1px dotted #274699",
//                 }}
//                 loading={getUploadLoading("project-doc")}
//               >
//                 Upload Document
//               </Button>
//             </Upload>
//           </div>
//         </div>
//       </div>

//       <h2 className="text-lg font-semibold mb-4 bg-white mt-10 text-black p-4 rounded-t-lg">
//         Project Stages
//       </h2>
//       <div className="border border-gray-300 rounded-b-lg">
//         <div className="hidden md:grid grid-cols-6 h-[50px] justify-center items-center bg-gray-100 text-black font-semibold text-sm p-2">
//           <div className="col-span-1">Stage Name</div>
//           <div className="col-span-5 text-center w-full">Stage Details</div>
//         </div>

//        <div className="grid grid-cols-1 md:grid-cols-6 border-t md:border-t-0 border-gray-300">
//   <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//     <div className="flex flex-col items-center space-y-2">
//       <p className="bg-[#E5EBFB] text-[#000088] h-[40px] w-full flex justify-center items-center font-semibold rounded">
//         Site Survey
//       </p>
//       {/* <Button
//         size="small"
//         icon={<SearchOutlined />}
//         onClick={fetchSiteSurveyDataOnDemand}
//         loading={loadingSiteSurvey}
//         style={{
//           backgroundColor: "#274699",
//           color: "white",
//           fontSize: "12px",
//           height: "30px"
//         }}
//       >
//         Fetch Data
//       </Button> */}
//     </div>
//   </div>
//   <div className="col-span-1 md:col-span-5 p-4">
//     {loadingSiteSurvey ? (
//       <div className="flex justify-center items-center h-32">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#274699] mx-auto mb-2"></div>
//           <p className="text-gray-500">Loading site survey data...</p>
//         </div>
//       </div>
//     ) : (
//       renderSection(
//         siteSurveyWindows,
//         setSiteSurveyWindows,
//         "siteSurvey",
//         true
//       )
//     )}
//   </div>
// </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               MMS
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(mmsWindows, setMmsWindows, "mms", false)}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0  md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               BOM
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(bomItems, setBomItems, "bom", false)}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               Production
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(
//               productionItems,
//               setProductionItems,
//               "production",
//               false
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1  bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-center text-[15px] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               Ready to Dispatch
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(
//               readyToDispatchItems,
//               setReadyToDispatchItems,
//               "readyToDispatch",
//               false
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               Dispatch
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(dispatchItems, setDispatchItems, "dispatch", false)}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               Fixing Team Info
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(
//               fixingTeamInfoItems,
//               setFixingTeamInfoItems,
//               "fixingTeamInfo",
//               false
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[50px] text-center flex justify-center items-center font-semibold">
//               Installation Complete
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(
//               installationCompleteItems,
//               setInstallationCompleteItems,
//               "installationComplete",
//               false
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-6 border-t border-gray-300">
//           <div className="col-span-1 bg-white items-center border-b md:border-b-0 md:border-r border-[#C0C0C0] justify-center p-4 font-medium">
//             <p className="bg-[#E5EBFB] text-[#000088] h-[40px] flex justify-center items-center font-semibold">
//               Testimonial
//             </p>
//           </div>
//           <div className="col-span-1 md:col-span-5 p-4">
//             {renderSection(
//               testimonialItems,
//               setTestimonialItems,
//               "testimonial",
//               false
//             )}
//           </div>
//         </div>
//         <div className="flex m-4 md:m-10 justify-center md:justify-end mt-4">
//           <Button
//             type="primary"
//             onClick={handleSubmit}
//             className="w-full md:w-auto"
//             style={{ backgroundColor: "#274699" }}
//             loading={isSubmitting || postLoading || putLoading}
//             disabled={isSubmitting || postLoading || putLoading}
//           >
//             {isSubmitting || postLoading || putLoading
//               ? mode === "add"
//                 ? "Creating Project..."
//                 : "Updating Project..."
//               : mode === "add"
//               ? "Create Project"
//               : "Update Project"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
