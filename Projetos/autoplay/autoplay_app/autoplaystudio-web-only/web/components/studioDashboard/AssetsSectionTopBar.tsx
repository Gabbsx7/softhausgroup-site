import React from 'react'

export function AssetsSectionTopBar() {
  return (
    <div className="flex items-end justify-between mb-6 w-full">
      {/* Título e contador */}
      <div className="flex items-end gap-3">
        <h3 className="text-[20px] font-medium text-black leading-none">
          Assets
        </h3>
        <span className="text-[10px] font-medium text-[#AAAAAA] mb-0.5">4</span>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1 ml-8">
        <button className="bg-white text-[#AEAEAE] text-[10px] font-normal rounded px-[10px] py-[5px]">
          + Filter
        </button>
        <button className="bg-[#E6E6E6] text-[#AEAEAE] text-[10px] font-normal rounded px-[10px] py-[5px]">
          All
        </button>
        <button className="bg-[#E6E6E6] text-[#AEAEAE] text-[10px] font-normal rounded px-[10px] py-[5px]">
          Images
        </button>
        <button className="bg-[#E6E6E6] text-[#AEAEAE] text-[10px] font-normal rounded px-[10px] py-[5px]">
          Videos
        </button>
        <button className="bg-[#E6E6E6] text-[#AEAEAE] text-[10px] font-normal rounded px-[10px] py-[5px]">
          PDF
        </button>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-2 bg-white rounded-[4px] px-3 py-2 border border-gray-200 shadow-sm">
          <span className="inline-flex items-center justify-center w-4 h-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="15"
                height="15"
                rx="4"
                stroke="#6C6C6C"
                strokeWidth="1"
              />
              <path
                d="M8.5 4.5V12.5"
                stroke="#6C6C6C"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M4.5 8.5H12.5"
                stroke="#6C6C6C"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-[8px] font-bold text-[#4E4E4E] tracking-widest uppercase">
            UPLOAD
          </span>
        </button>
        <button className="bg-white rounded-full px-[15px] py-[6px] text-[12px] text-black font-normal shadow-sm border border-gray-200">
          + Create new asset
        </button>
      </div>
    </div>
  )
}
