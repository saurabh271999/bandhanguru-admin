"use client";

import React from "react";
import ContentLoader from "react-content-loader";

interface FormSkeletonLoaderProps {
  fields?: number;
  showTitle?: boolean;
  showDescription?: boolean;
  showButtons?: boolean;
  buttonCount?: number;
  fieldHeight?: number;
  fieldSpacing?: number;
}

const FormSkeletonLoader: React.FC<FormSkeletonLoaderProps> = ({
  fields = 6,
  showTitle = true,
  showDescription = true,
  showButtons = true,
  buttonCount = 2,
  fieldHeight = 48,
  fieldSpacing = 24,
}) => {
  const titleHeight = showTitle ? 40 : 0;
  const descriptionHeight = showDescription ? 24 : 0;
  const buttonsHeight = showButtons ? 56 : 0;
  const totalHeight = titleHeight + descriptionHeight + (fields * fieldHeight) + ((fields - 1) * fieldSpacing) + buttonsHeight + 40;

  return (
    <ContentLoader
      width="100%"
      height={totalHeight}
      viewBox={`0 0 600 ${totalHeight}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Title */}
      {showTitle && (
        <rect x="20" y="20" rx="6" ry="6" width="300" height="32" />
      )}

      {/* Description */}
      {showDescription && (
        <rect x="20" y={titleHeight + 35} rx="4" ry="4" width="400" height="16" />
      )}

      {/* Form Fields */}
      {Array.from({ length: fields }).map((_, fieldIndex) => {
        const y = titleHeight + descriptionHeight + 60 + (fieldIndex * (fieldHeight + fieldSpacing));
        
        return (
          <React.Fragment key={fieldIndex}>
            {/* Field Label */}
            <rect x="20" y={y} rx="4" ry="4" width="120" height="16" />
            
            {/* Field Input */}
            <rect x="20" y={y + 28} rx="6" ry="6" width="500" height={fieldHeight} />
          </React.Fragment>
        );
      })}

      {/* Action Buttons */}
      {showButtons && (
        <div>
          {Array.from({ length: buttonCount }).map((_, buttonIndex) => {
            const x = 20 + (buttonIndex * 140);
            const y = titleHeight + descriptionHeight + 60 + (fields * fieldHeight) + ((fields - 1) * fieldSpacing) + 20;
            
            return (
              <rect
                key={buttonIndex}
                x={x}
                y={y}
                rx="6"
                ry="6"
                width="120"
                height="40"
              />
            );
          })}
        </div>
      )}
    </ContentLoader>
  );
};

export default FormSkeletonLoader;
