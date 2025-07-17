import React from 'react'

const AddCardMember: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      className="flex items-center justify-center gap-2.5 px-6 py-1.5 bg-white text-black text-xs rounded-[50px] hover:bg-gray-50 transition-colors"
      onClick={onClick}
      type="button"
    >
      + Add Member
    </button>
  )
}

export default AddCardMember
