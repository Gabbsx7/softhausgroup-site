import React from 'react'

export const CompassIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
)

export const ExpandDownIcon = ({ className }: { className?: string }) => (
  <svg
    width="15"
    height="14"
    viewBox="0 0 15 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3.75 5.25L7.5 8.75L11.25 5.25"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const FolderIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.5 13.875C16.5 14.4273 16.0523 14.875 15.5 14.875H2.5C1.94772 14.875 1.5 14.4273 1.5 13.875V4.125C1.5 3.57272 1.94772 3.125 2.5 3.125H6.5L8.5 5.125H15.5C16.0523 5.125 16.5 5.57272 16.5 6.125V13.875Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
)

export const CheckRingIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="9"
      cy="9"
      r="6.75"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M6 9.75L8.25 12L12 6.75"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const TimeProgressIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="9"
      cy="9"
      r="6.75"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M9 5.25V9L11.25 11.25"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 1.875V3.375"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M15.75 9H14.25"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M12 14.625V16.125"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M3.75 9H2.25"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

export const PendingIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="9"
      cy="9"
      r="7.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
)

export const ImageBoxIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="1.46"
      y="1.46"
      width="11.08"
      height="11.08"
      rx="2"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M1.46 9.33L5.54 5.25L8.75 8.46L12.54 4.67"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10.5" cy="4.5" r="0.875" fill="currentColor" />
  </svg>
)

export const AddSquareIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 5.33V10.67"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M5.33 8H10.67"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

export const AddRingIcon = ({ className }: { className?: string }) => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12.5" cy="12.5" r="9.375" fill="#F4F4F4" />
    <path
      d="M12.5 9.375V15.625"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M9.375 12.5H15.625"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

export const VideoFileIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="1.46"
      y="1.46"
      width="11.08"
      height="11.08"
      rx="2"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path d="M5.25 4.375L9.625 7L5.25 9.625V4.375Z" fill="currentColor" />
  </svg>
)

export const FileDocIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="1.46"
      y="1.46"
      width="11.08"
      height="11.08"
      rx="2"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M4.375 4.375H9.625"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M4.375 7H9.625"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M4.375 9.625H7"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

export const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g opacity="0.2">
      <path
        d="M7.38 8.44L3.5 12.32L7.38 16.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="0"
        y="0"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M16.38 0V14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </g>
  </svg>
)
