'use client'

import React from 'react'

interface QuickSelectionProps {
  className?: string
}

export function QuickSelection({ className }: QuickSelectionProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 p-5 w-[577px] h-[228px] rounded ${
        className || ''
      }`}
    >
      {/* Welcome Message */}
      <div className="flex flex-col gap-2.5 p-1.5">
        <span className="text-[32px] font-normal leading-[38.75px] text-black w-[542px]">
          Welcome back! Check out all the projects and assets
        </span>
      </div>

      {/* Search Section */}
      <div className="flex flex-col justify-center items-stretch gap-2.5 h-[97px]">
        <div className="flex items-center gap-2.5 px-10 py-3.5 bg-white rounded-[50px] w-[400px]">
          <span className="text-xs font-normal leading-[14.52px] text-[#989898]">
            Search for projects or assets
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickSelection
