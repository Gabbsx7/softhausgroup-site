import React, { useState } from 'react'
import NewProjectModal from './NewProjectModal'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams } from 'next/navigation'

interface Props {
  onProjectCreated?: () => void
}

const AddCardProject: React.FC<Props> = ({ onProjectCreated }) => {
  const [showModal, setShowModal] = useState(false)
  const params = useParams()
  const clientId = params?.clientId as string | undefined

  const handleCreate = async (data: any) => {
    if (!clientId) return
    const supabase = createClientComponentClient()
    const { error } = await supabase.from('projects').insert([
      {
        name: data.name,
        description: data.description,
        goal: data.goal,
        start_date: data.start_date,
        end_date: data.end_date,
        budget: data.budget,
        category: data.category,
        client_id: clientId,
      },
    ])
    setShowModal(false)
    if (!error) onProjectCreated?.()
    // TODO: feedback de erro
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
        onCreate={handleCreate}
        clientId={clientId}
      />
    </>
  )
}

export default AddCardProject
