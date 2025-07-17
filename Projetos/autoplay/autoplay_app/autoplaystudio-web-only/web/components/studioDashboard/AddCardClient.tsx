import React, { useState } from 'react'
import NewClientModal from './NewClientModal'

interface Props {
  onClientCreated?: () => void
}

const AddCardClient: React.FC<Props> = ({ onClientCreated }) => {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = () => {
    onClientCreated?.()
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
        <div className="text-[12px] font-medium text-black">Add new client</div>
      </div>

      <NewClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default AddCardClient
