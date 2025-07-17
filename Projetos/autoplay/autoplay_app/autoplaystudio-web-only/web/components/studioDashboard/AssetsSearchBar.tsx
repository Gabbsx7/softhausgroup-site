import React, { useState } from 'react'

export function AssetsSearchBar({
  onSearch,
}: {
  onSearch?: (value: string) => void
}) {
  const [value, setValue] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="w-96 flex justify-between items-center mb-6">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search assets and files"
          className="w-full pl-4 pr-10 py-2 rounded-full bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-100 text-[10px] font-medium text-gray-400 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8.5" cy="8.5" r="6" stroke="#222" strokeWidth="1" />
            <path
              d="M15 15L13 13"
              stroke="#222"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
  )
}
