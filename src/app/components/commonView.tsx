// "use client";
// import React from "react";
// import SiteSurveyCard from "@/app/components/commonViewStages/CommonCard"; // import reusable card

// interface SubView {
//   label: string;
//   value?: string;
// }

// interface Remark {
//   text: string;
//   date: string;
//   time: string;
// }

// interface CommonViewCardProps {
//   titleRow?: { label: string; value: string | undefined };
//   fields: {
//     label: string;
//     value?: string;
//     subFields?: SubView[];
//   }[];
//   status?: string;
//   remarks?: Remark[];
//   loading?: boolean;
//   error?: string;
//   siteSurvey?: {
//     title: string;
//     sites: { label: string; value: string }[];
//     fields: { label: string; value?: string; color?: string }[];
//   };
// }

// export default function CommonViewCard({
//   titleRow,
//   fields,
//   status,
//   remarks,
//   loading,
//   error,
//   siteSurvey,
// }: CommonViewCardProps) {
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div className="border border-[#E2F2C3] rounded shadow bg-white m-5">
//       {/* Title Row */}
//       {titleRow && (
//         <div className="flex rounded-t px-5 bg-[#274699] text-white py-3">
//           <div className="font-semibold w-1/2">{titleRow.label}</div>
//           <div className="font-semibold w-1/2">{titleRow.value || "N/A"}</div>
//         </div>
//       )}

//       {/* Content Fields */}
//       <div className="grid grid-cols-1 gap-y-5 mt-4 text-sm text-black p-5">
//         {fields.map((item, idx) => (
//           <div key={idx} className="w-full">
//             <div className="flex">
//               <div className="w-1/2 font-semibold text-gray-600">
//                 {item.label}:
//               </div>
//               <div className="w-1/2 text-black">{item.value || "N/A"}</div>
//             </div>

//             {/* Sub Fields */}
//             {item.subFields && item.subFields.length > 0 && (
//               <div className="ml-4 mt-2 border-l-2 border-gray-200 pl-4">
//                 {item.subFields.map((sub, subIdx) => (
//                   <div key={subIdx} className="flex text-sm">
//                     <div className="w-1/2 text-gray-500">{sub.label}:</div>
//                     <div className="w-1/2">{sub.value || "N/A"}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Status */}
//         {status && (
//           <div className="flex w-full items-center">
//             <div className="w-1/2 font-semibold text-gray-600">Status:</div>
//             <div className="w-1/2">
//               <span
//                 className={`px-4 py-1 rounded-full font-medium ${
//                   status === "active"
//                     ? "bg-[#D4F7DC] text-[#0F9D58]"
//                     : "bg-gray-300 text-gray-600"
//                 }`}
//               >
//                 {status || "N/A"}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Remarks */}
//         {remarks && remarks.length > 0 && (
//           <div className="mt-4 col-span-full">
//             <div className="font-semibold text-gray-600 mb-2">Remarks</div>
//             <div className="space-y-3">
//               {remarks.map((remark, idx) => (
//                 <div key={idx} className="border-b border-gray-200 pb-2">
//                   <p className="text-sm text-gray-800">{remark.text}</p>
//                   <p className="text-xs text-[#274699] font-medium mt-1">
//                     {remark.date} | {remark.time}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Site Survey */}
//         {siteSurvey && (
//           <SiteSurveyCard
//             title={siteSurvey.title}
//             sites={siteSurvey.sites}
//             fields={siteSurvey.fields}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
