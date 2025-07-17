'use client'

import React from 'react'

export function WelcomeBanner() {
  return (
    <div
      className="bg-transparent rounded-[4px] p-0"
      style={{ width: 577, height: 228 }}
    >
      <div className="flex flex-col gap-[10px] p-[20px_0_0_0]">
        <h2
          className="text-[32px] font-normal text-black mb-[10px] leading-[1.21] font-inter"
          style={{ width: 542 }}
        >
          Welcome back! Check out all the projects and assets
        </h2>
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search for projects or assets"
            className="bg-white rounded-full flex items-center text-[12px] text-[#989898] font-inter"
            style={{
              padding: '15px 40px',
              width: 400,
              outline: 'none',
              border: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Exportar WelcomeBanner como QuickSelection também para compatibilidade
export { WelcomeBanner as QuickSelection }
