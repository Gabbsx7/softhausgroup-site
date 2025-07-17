import { useRouter, useParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { MilestoneCard } from './MilestoneCard'

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
  progress?: number
  due_date?: string
}

interface MilestonesSectionProps {
  milestones: Milestone[]
  onCreateMilestone?: () => void
  onMilestoneClick?: (milestone: Milestone) => void
  compact?: boolean
}

export function MilestonesSection({
  milestones,
  onCreateMilestone,
  onMilestoneClick,
  compact = false,
}: MilestonesSectionProps) {
  const router = useRouter()
  const params = useParams() as { clientId: string; projectId: string }

  const handleMilestoneClick = (milestone: Milestone) => {
    if (onMilestoneClick) {
      onMilestoneClick(milestone)
    } else {
      router.push(
        `/dashboard/client/${params.clientId}/project/${params.projectId}/milestone/${milestone.id}`
      )
    }
  }

  return (
    <div className="py-5">
      <div className="flex items-end justify-between mb-2.5">
        <div className="flex items-end gap-2.5">
          <div className="flex items-center justify-center gap-2.5 py-2.5">
            <h2 className="text-sm font-medium text-black">Milestones</h2>
          </div>
          <div className="flex items-center justify-center gap-2.5 pb-7.5">
            <span className="text-[10px] font-medium text-[#AAAAAA]">
              {milestones.length}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onCreateMilestone}
            className="flex items-center justify-center gap-2.5 px-6 py-1.5 bg-white text-black text-xs rounded-[50px] hover:bg-gray-50 transition-colors"
          >
            + New Milestone
          </button>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No milestones found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first milestone to start organizing the project.
          </p>
          <button
            onClick={onCreateMilestone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Milestone
          </button>
        </div>
      ) : compact ? (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onClick={() => handleMilestoneClick(milestone)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0 h-[62px]">
          <div className="grid grid-cols-3 gap-6">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onClick={() => handleMilestoneClick(milestone)}
                className="w-[320px]"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
