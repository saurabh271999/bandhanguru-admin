"use client";
import React, { useState, useEffect } from "react";
import {VideoCameraOutlined,
  CustomerServiceOutlined}
  from "@ant-design/icons";
  
interface TestimonialItem {
  id: string;
  name: string;
  feedback: string;
  videoFile?: File | null;
  audioFile?: File | null;
  videoPreview?: string;
  audioPreview?: string;
}

interface TestimonialsCardProps {
  testimonials: TestimonialItem[];
  onTestimonialUpdate: (testimonial: TestimonialItem) => void;
  onTestimonialAdd: (testimonial: TestimonialItem) => void;
}

export default function TestimonialsCard({ 
  testimonials, 
  onTestimonialUpdate, 
  onTestimonialAdd 
}: TestimonialsCardProps) {
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialItem | null>(null);
  const [feedback, setFeedback] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [currentVideoPreview, setCurrentVideoPreview] = useState<string | undefined>("");

  useEffect(() => {
    if (testimonials.length > 0 && !selectedTestimonial) {
      const initialTestimonial = testimonials[0];
      setSelectedTestimonial(initialTestimonial);
      setFeedback(initialTestimonial.feedback || "");
      setCurrentVideoPreview(initialTestimonial.videoPreview);
    }
  }, [testimonials, selectedTestimonial]);

  const handleTestimonialSelect = (testimonial: TestimonialItem) => {
    setSelectedTestimonial(testimonial);
    setFeedback(testimonial.feedback || "");
    setVideoFile(null);
    setAudioFile(null);
    setCurrentVideoPreview(testimonial.videoPreview);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentVideoPreview(reader.result as string);
        if (selectedTestimonial) {
          const updated = {
            ...selectedTestimonial,
            videoFile: file,
            videoPreview: reader.result as string,
          };
          onTestimonialUpdate(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedTestimonial) {
      setAudioFile(file);
      const updated = {
        ...selectedTestimonial,
        audioFile: file,
      };
      onTestimonialUpdate(updated);
    }
  };

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFeedback = event.target.value;
    setFeedback(newFeedback);
    if (selectedTestimonial) {
      const updated = {
        ...selectedTestimonial,
        feedback: newFeedback,
      };
      onTestimonialUpdate(updated);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        Testimonials
      </h2>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col lg:flex-row">
        {/* Left Column for Client/Admin Names */}
        <div className="w-full lg:w-1/4 border-b-2 lg:border-b-0 lg:border-r-2 border-gray-100">
          <div className="bg-gray-100 rounded-t-lg lg:rounded-tl-lg lg:rounded-tr-none p-3 sm:p-4">
            <h3 className="text-sm sm:text-base text-[#000088] font-semibold text-center lg:text-left">
              Name Of Client/Admin
            </h3>
          </div>
          <div className="flex items-center justify-center p-3 sm:p-4 min-h-[120px] lg:min-h-[250px]">
            <p className="text-sm sm:text-base">Supritha Iyer</p>
          </div>
        </div>

        {/* Right Column for Reviews */}
        <div className="w-full lg:w-3/4">
          <div className="bg-gray-100 rounded-b-lg lg:rounded-bl-none lg:rounded-tr-lg p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold text-center text-[#000088]">Reviews</h3>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            {selectedTestimonial ? (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[#000088] text-xs sm:text-sm font-medium text-gray-500 mb-2">
                    Add Client Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    className="w-full h-20 sm:h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  />
                </div>

                                 <div className="flex flex-row gap-4 sm:gap-6">
                   <div className="flex-1">
                     <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                       Upload Video
                     </label>
                     <div className="relative">
                       <input
                         type="file"
                         accept="video/*"
                         onChange={handleVideoUpload}
                         className="hidden"
                         id="video-upload"
                       />
                       <label
                         htmlFor="video-upload"
                         className="block w-full h-32 sm:h-40 border-2 border-dashed border-[#274699] rounded-lg cursor-pointer hover:border-gray-400"
                       >
                         {currentVideoPreview ? (
                           <div className="relative w-full h-full flex items-center justify-center">
                             <img
                               src={"https://i.ibb.co/b3hJq7v/image.png"}
                               alt="Video preview"
                               className="w-full h-full object-cover rounded-lg"
                             />
                             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
                               <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                 <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M8 5v14l11-7z" />
                                 </svg>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             {/* <p className="text-xs sm:text-sm">Click or drag to upload video</p> */}
                           </div>
                         )}
                       </label>
                     </div>
                   </div>

                   <div className="flex-1">
                     <label className="block text-xs sm:text-sm font-medium mb-2">
                       Upload Audio
                     </label>
                     <div className="relative">
                       <input
                         type="file"
                         accept="audio/*"
                         onChange={handleAudioUpload}
                         className="hidden"
                         id="audio-upload"
                       />
                       <label
                         htmlFor="audio-upload"
                         className="block w-full h-32 sm:h-40 border-2 border-dashed border-[#274699] rounded-lg cursor-pointer hover:border-gray-400"
                       >
                         {audioFile ? (
                           <div className="flex items-center justify-center h-full">
                             <div className="text-center">
                               <span className="text-xs sm:text-sm text-gray-600">
                                 {audioFile.name}
                               </span>
                             </div>
                           </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                               {/* <p className="text-xs sm:text-sm">Click or drag to upload audio</p> */}
                             </div>
                         )}
                       </label>
                     </div>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
                Select a client/admin to add reviews
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}