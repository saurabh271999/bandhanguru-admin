// components/CommonButton.tsx
"use client";
import React from "react";
import { Button } from "antd";

type CommonButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  type?: "default" | "primary" | "dashed" | "link" | "text";
  danger?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: "primary" | "default";
  icon?: React.ReactNode;
};

const CommonButton: React.FC<CommonButtonProps> = ({
  label,
  onClick,
  loading = false,
  type = "default",
  danger = false,
  className = "",
  style = {},
  variant = "default",
  icon,
}) => {
  const defaultStyles: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: "#274699",
          color: "#fff",
        }
      : {};

  const combinedStyle = {
    width: 140,
    height: 40,
    ...defaultStyles,
    ...style,
  };

  const combinedClassName =
    variant === "primary"
      ? `${className} hover:!bg-[#1a357a]`
      : className;

  return (
    <Button
      type={type}
      danger={danger}
      onClick={onClick}
      loading={loading}
      style={combinedStyle}
      className={combinedClassName}
      icon={icon}
    >
      {label}
    </Button>
  );
};

export default CommonButton;