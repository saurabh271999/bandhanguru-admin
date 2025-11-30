// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft, Save } from "lucide-react";
// import { Button, Input, Select, message, Spin, DatePicker, Slider } from "antd";
// import dayjs from "dayjs";
// import usePostQuery from "../hooks/postQuery.hook";
// import useGetQuery from "../hooks/getQuery.hook";
// import { apiUrls } from "../apis";

// const { Option } = Select;
// const { TextArea } = Input;

// export default function AddProject() {
//   const router = useRouter();
//   const { postQuery } = usePostQuery();
//   const { getQuery } = useGetQuery();

//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [formData, setFormData] = useState({
//     projectName: "",
//     projectCode: "",
//     description: "",
//     client: "",
//     projectManager: "",
//     startDate: "",
//     endDate: "",
//     status: "planning",
//     priority: "medium",
//     progress: 0,
//     budget: {
//       amount: 0,
//       currency: "USD",
//     },
//     location: {
//       address: "",
//       city: "",
//       state: "",
//       zipCode: "",
//       country: "USA",
//     },
//     teamMembers: [],
//     technologies: [],
//     milestones: [],
//     documents: [],
//   });

//   // Load clients and users for dropdowns
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Load clients
//         await getQuery({
//           url: apiUrls.getAllClients,
//           onSuccess: (response: any) => {
//             if (response.success || response.status === "success") {
//               const clientsData = response.clients || response.data || [];
//               setClients(clientsData);
//             }
//           },
//           onFail: (error: any) => {
//             console.error("Failed to load clients:", error);
//           },
//         });

//         // Load users
//         await getQuery({
//           url: apiUrls.getAllUsers,
//           onSuccess: (response: any) => {
//             if (response.success || response.status === "success") {
//               const usersData = response.users || response.data || [];
//               setUsers(usersData);
//             }
//           },
//           onFail: (error: any) => {
//             console.error("Failed to load users:", error);
//           },
//         });
//       } catch (error) {
//         console.error("Error loading data:", error);
//       }
//     };

//     loadData();
//   }, [getQuery]);

//   const handleSubmit = async () => {
//     // Validation
//     if (!formData.projectName.trim()) {
//       message.error("Project name is required");
//       return;
//     }
//     if (!formData.client) {
//       message.error("Client is required");
//       return;
//     }
//     if (!formData.projectManager) {
//       message.error("Project manager is required");
//       return;
//     }
//     if (!formData.startDate) {
//       message.error("Start date is required");
//       return;
//     }
//     if (!formData.endDate) {
//       message.error("End date is required");
//       return;
//     }

//     setLoading(true);
//     try {
//       await postQuery({
//         url: apiUrls.createProject,
//         data: formData,
//         onSuccess: (response: any) => {
//           if (response.success || response.status === "success") {
//             message.success("Project created successfully");
//             router.push("/dashboard/projectmanagement");
//           } else {
//             message.error(response.message || "Failed to create project");
//           }
//         },
//         onFail: (error: any) => {
//           message.error("Failed to create project");
//           console.error("Error creating project:", error);
//         },
//       });
//     } catch (error) {
//       message.error("An error occurred");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const technologyOptions = [
//     "React",
//     "Node.js",
//     "Python",
//     "Java",
//     "Angular",
//     "Vue.js",
//     "MongoDB",
//     "PostgreSQL",
//     "AWS",
//     "Azure",
//     "Docker",
//     "Kubernetes",
//   ];

//   return (
//     <div className="bg-white p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto min-h-screen">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center space-x-4">
//           {/* <h1 className="text-2xl font-bold text-gray-900">Add New Project</h1> */}
//         </div>
//       </div>

//       <div className="border-2 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
//         <Spin spinning={loading}>
//           <div className="space-y-6">
//             {/* Basic Information */}
//             <div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className=" block text-sm font-medium text-gray-700 mb-2">
//                     Project Code
//                   </label>
//                   <Input
//                     value={formData.projectName}
//                     onChange={(e) =>
//                       setFormData({ ...formData, projectName: e.target.value })
//                     }
//                     placeholder="e.g., TechCorp Office Renovation"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Project Code
//                   </label>
//                   <Input
//                     value={formData.projectCode}
//                     onChange={(e) =>
//                       setFormData({ ...formData, projectCode: e.target.value })
//                     }
//                     placeholder="e.g., PRJ001"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <TextArea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({ ...formData, description: e.target.value })
//                     }
//                     placeholder="Project description..."
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Client & Manager */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Client & Management
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Client
//                   </label>
//                   <Select
//                     value={formData.client}
//                     onChange={(value) =>
//                       setFormData({ ...formData, client: value })
//                     }
//                     placeholder="Select client"
//                     className="w-full"
//                   >
//                     {clients.map((client: any) => (
//                       <Option key={client._id} value={client._id}>
//                         {client.clientName || client.companyName}
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Project Manager
//                   </label>
//                   <Select
//                     value={formData.projectManager}
//                     onChange={(value) =>
//                       setFormData({ ...formData, projectManager: value })
//                     }
//                     placeholder="Select project manager"
//                     className="w-full"
//                   >
//                     {users.map((user: any) => (
//                       <Option key={user._id} value={user._id}>
//                         {user.firstName} {user.lastName}
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Timeline */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Timeline
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Start Date
//                   </label>
//                   <DatePicker
//                     value={
//                       formData.startDate ? dayjs(formData.startDate) : null
//                     }
//                     onChange={(date) =>
//                       setFormData({
//                         ...formData,
//                         startDate: date ? date.format("YYYY-MM-DD") : "",
//                       })
//                     }
//                     className="w-full"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     End Date
//                   </label>
//                   <DatePicker
//                     value={formData.endDate ? dayjs(formData.endDate) : null}
//                     onChange={(date) =>
//                       setFormData({
//                         ...formData,
//                         endDate: date ? date.format("YYYY-MM-DD") : "",
//                       })
//                     }
//                     className="w-full"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Status & Priority */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Status & Priority
//               </h2>
//               <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <Select
//                     value={formData.status}
//                     onChange={(value) =>
//                       setFormData({ ...formData, status: value })
//                     }
//                     className="w-full"
//                   >
//                     <Option value="planning">Planning</Option>
//                     <Option value="in-progress">In Progress</Option>
//                     <Option value="on-hold">On Hold</Option>
//                     <Option value="completed">Completed</Option>
//                     <Option value="cancelled">Cancelled</Option>
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Priority
//                   </label>
//                   <Select
//                     value={formData.priority}
//                     onChange={(value) =>
//                       setFormData({ ...formData, priority: value })
//                     }
//                     className="w-full"
//                   >
//                     <Option value="low">Low</Option>
//                     <Option value="medium">Medium</Option>
//                     <Option value="high">High</Option>
//                     <Option value="urgent">Urgent</Option>
//                   </Select>
//                 </div>
//                 <div className="ml-5 ">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Progress ({formData.progress}%)
//                   </label>
//                   <Slider
//                     value={formData.progress}
//                     onChange={(value) =>
//                       setFormData({ ...formData, progress: value })
//                     }
//                     min={0}
//                     max={100}
//                     step={5}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Budget */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Budget
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Amount
//                   </label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.budget.amount}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         budget: {
//                           ...formData.budget,
//                           amount: parseFloat(e.target.value) || 0,
//                         },
//                       })
//                     }
//                     placeholder="e.g., 50000"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Currency
//                   </label>
//                   <Select
//                     value={formData.budget.currency}
//                     onChange={(value) =>
//                       setFormData({
//                         ...formData,
//                         budget: { ...formData.budget, currency: value },
//                       })
//                     }
//                     className="w-full"
//                   >
//                     <Option value="USD">USD</Option>
//                     <Option value="EUR">EUR</Option>
//                     <Option value="GBP">GBP</Option>
//                     <Option value="INR">INR</Option>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Location */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Location
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address
//                   </label>
//                   <Input
//                     value={formData.location.address}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         location: {
//                           ...formData.location,
//                           address: e.target.value,
//                         },
//                       })
//                     }
//                     placeholder="e.g., 123 Business Street"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     City
//                   </label>
//                   <Input
//                     value={formData.location.city}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         location: {
//                           ...formData.location,
//                           city: e.target.value,
//                         },
//                       })
//                     }
//                     placeholder="e.g., New York"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     State
//                   </label>
//                   <Input
//                     value={formData.location.state}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         location: {
//                           ...formData.location,
//                           state: e.target.value,
//                         },
//                       })
//                     }
//                     placeholder="e.g., NY"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     ZIP Code
//                   </label>
//                   <Input
//                     value={formData.location.zipCode}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         location: {
//                           ...formData.location,
//                           zipCode: e.target.value,
//                         },
//                       })
//                     }
//                     placeholder="e.g., 10001"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Country
//                   </label>
//                   <Input
//                     value={formData.location.country}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         location: {
//                           ...formData.location,
//                           country: e.target.value,
//                         },
//                       })
//                     }
//                     placeholder="e.g., USA"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Team & Technologies */}
//             <div className="mt-15">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Team & Technologies
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Team Members
//                   </label>
//                   <Select
//                     mode="multiple"
//                     value={formData.teamMembers}
//                     onChange={(value) =>
//                       setFormData({ ...formData, teamMembers: value })
//                     }
//                     placeholder="Select team members"
//                     className="w-full"
//                   >
//                     {users.map((user: any) => (
//                       <Option key={user._id} value={user._id}>
//                         {user.firstName} {user.lastName}
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Technologies
//                   </label>
//                   <Select
//                     mode="multiple"
//                     value={formData.technologies}
//                     onChange={(value) =>
//                       setFormData({ ...formData, technologies: value })
//                     }
//                     placeholder="Select technologies"
//                     className="w-full"
//                   >
//                     {technologyOptions.map((tech) => (
//                       <Option key={tech} value={tech}>
//                         {tech}
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end space-x-4 pt-6 border-t">
//               <Button
//                 onClick={() => router.push("/dashboard/projectmanagement")}
//                 className="flex items-center"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="primary"
//                 icon={<Save />}
//                 onClick={handleSubmit}
//                 loading={loading}
//                 className="flex items-center"
//               >
//                 Create Project
//               </Button>
//             </div>
//           </div>
//         </Spin>
//       </div>
//     </div>
//   );
// }
