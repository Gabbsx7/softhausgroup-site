'use client'

import React, { useState } from 'react'
import NewProjectModal from './NewProjectModal'

interface Props {
  onProjectCreated?: () => void
}

const AddCard: React.FC<Props> = ({ onProjectCreated }) => {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = () => {
    onProjectCreated?.()
  }

  return (
    <>
      <div
        className="w-full h-[180px] bg-white rounded-[12px] border border-[#E3E3E3] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center mb-2">
          <span className="text-[#A0A0A0] text-xl">+</span>
        </div>
        <div className="text-[12px] font-medium text-black">
          Add new project
        </div>
      </div>

      <NewProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleSuccess}
      />
    </>
  )
}

export default AddCard
