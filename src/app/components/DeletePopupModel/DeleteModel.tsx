import React from "react";

const DeleteModel = ({
  onConfirm,
  onCancel,
  title,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 shadow-2xl min-w-[340px] max-w-xs flex flex-col items-center">
        <div className="flex flex-col items-center mb-4">
          <svg
            className="w-12 h-12 text-[var(--brand-primary)] mb-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Delete {title}?
          </h1>
          <p className="text-center text-gray-700 text-sm mb-2">
            Are you sure you want to delete this {title}?
          </p>
        </div>
        <div className="flex gap-3 w-full justify-center">
          <button
            className="flex-1 px-4 py-2 cursor-pointer rounded-md border border-gray-300 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 cursor-pointer rounded-md bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-700)] transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModel;
