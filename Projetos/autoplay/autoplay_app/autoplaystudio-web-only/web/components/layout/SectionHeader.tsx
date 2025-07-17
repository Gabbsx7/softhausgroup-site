'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  count?: number | string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
}

export function SectionHeader({
  title,
  count,
  buttonText,
  onButtonClick,
  className,
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between w-full ${className || ''}`}>
      {/* Left Side - Title and Count */}
      <div className="flex items-end gap-2.5">
        {/* Title */}
        <div className="flex items-center justify-center gap-2.5 py-2.5">
          <span className="text-xl font-medium leading-[24.2px] text-black">
            {title}
          </span>
        </div>

        {/* Count Badge */}
        {count !== undefined && (
          <div className="flex items-center justify-center gap-2.5 pb-7.5">
            <span className="text-[10px] font-medium leading-[12.1px] text-[#AAAAAA]">
              {count}
            </span>
          </div>
        )}
      </div>

      {/* Right Side - Button */}
      {buttonText && onButtonClick && (
        <div className="flex items-center justify-end gap-2.5 h-full">
          <button
            onClick={onButtonClick}
            className="flex items-center justify-center gap-2.5 px-6 py-1.5 bg-white rounded-[50px] hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-normal leading-[14.52px] text-black">
              {buttonText}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SectionHeader
