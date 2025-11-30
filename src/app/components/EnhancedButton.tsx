"use client";
import React from "react";
import { Button } from "antd";
import { Loader2 } from "lucide-react";

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  size?: "small" | "middle" | "large";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  shape?: "default" | "circle" | "round";
  block?: boolean;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  type = "default",
  size = "middle",
  variant = "primary",
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  style = {},
  href,
  target,
  shape = "default",
  block = false,
}) => {
  const getVariantStyles = () => {
    const baseStyles = "transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95";
    
    switch (variant) {
      case "primary":
        return `${baseStyles} bg-gradient-to-r from-[#274699] to-[#1a357a] border-[#274699] text-white hover:from-[#1a357a] hover:to-[#274699] hover:shadow-lg hover:shadow-blue-500/25`;
      case "secondary":
        return `${baseStyles} bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 hover:shadow-md`;
      case "success":
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25`;
      case "warning":
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-500 text-white hover:from-orange-500 hover:to-red-500 hover:shadow-lg hover:shadow-orange-500/25`;
      case "danger":
        return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 border-red-500 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25`;
      case "ghost":
        return `${baseStyles} bg-transparent border-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900`;
      case "outline":
        return `${baseStyles} bg-transparent border-2 border-[#274699] text-[#274699] hover:bg-[#274699] hover:text-white hover:shadow-md`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return "h-8 px-3 text-sm";
      case "large":
        return "h-12 px-6 text-lg";
      default:
        return "h-10 px-4 text-base";
    }
  };

  const getShapeStyles = () => {
    switch (shape) {
      case "circle":
        return "rounded-full aspect-square p-0";
      case "round":
        return "rounded-full";
      default:
        return "rounded-lg";
    }
  };

  const combinedClassName = `
    ${getVariantStyles()}
    ${getSizeStyles()}
    ${getShapeStyles()}
    ${fullWidth || block ? "w-full" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}
    ${loading ? "cursor-wait" : ""}
    ${className}
  `.trim();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (icon && iconPosition === "left") {
      return (
        <div className="flex items-center space-x-2">
          <span className="flex-shrink-0">{icon}</span>
          <span>{children}</span>
        </div>
      );
    }

    if (icon && iconPosition === "right") {
      return (
        <div className="flex items-center space-x-2">
          <span>{children}</span>
          <span className="flex-shrink-0">{icon}</span>
        </div>
      );
    }

    return children;
  };

  const buttonProps = {
    onClick,
    disabled: disabled || loading,
    className: combinedClassName,
    style,
    type: type as any,
    shape: shape as any,
    block,
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={combinedClassName}
        style={style}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <Button {...buttonProps}>
      {renderContent()}
    </Button>
  );
};

// Preset button components for common use cases
export const PrimaryButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="secondary" />
);

export const SuccessButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="success" />
);

export const WarningButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="warning" />
);

export const DangerButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="danger" />
);

export const GhostButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="ghost" />
);

export const OutlineButton: React.FC<Omit<EnhancedButtonProps, "variant">> = (props) => (
  <EnhancedButton {...props} variant="outline" />
);

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = "horizontal",
  spacing = "normal",
  className = "",
}) => {
  const getSpacingClass = () => {
    switch (spacing) {
      case "tight":
        return orientation === "horizontal" ? "space-x-1" : "space-y-1";
      case "loose":
        return orientation === "horizontal" ? "space-x-4" : "space-y-4";
      default:
        return orientation === "horizontal" ? "space-x-2" : "space-y-2";
    }
  };

  return (
    <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} ${getSpacingClass()} ${className}`}>
      {children}
    </div>
  );
};

export default EnhancedButton;
