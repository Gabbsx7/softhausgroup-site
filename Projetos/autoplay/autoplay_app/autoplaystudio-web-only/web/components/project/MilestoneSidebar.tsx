import React from 'react'
import { CheckCircle, Clock, Circle, ChevronDown, Plus } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'

interface Member {
  id: string
  name: string
  avatarUrl?: string
}

interface Task {
  id: string
  name: string
  status: 'todo' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
  assignedTo?: Member
}

interface MilestoneItem {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled'
}

interface Asset {
  id: string
  name: string
  url: string
  thumbnail?: string
  status: 'approved' | 'pending' | 'rejected'
}

interface MilestoneSidebarProps {
  milestone: {
    id: string
    title: string
    description?: string
    category?: string
    deadline?: string
    budget?: string
    status: 'completed' | 'in_progress' | 'pending' | 'cancelled'
    members?: Member[]
  }
  milestones: MilestoneItem[]
  onSelectMilestone: (id: string) => void
  tasks: Task[]
  assets: Asset[]
  onAddTask?: () => void
}

export function MilestoneSidebar({
  milestone,
  milestones,
  onSelectMilestone,
  tasks,
  assets,
  onAddTask,
}: MilestoneSidebarProps) {
  const [tasksOpen, setTasksOpen] = React.useState(true)
  const [assetsOpen, setAssetsOpen] = React.useState(true)

  return (
    <aside className="w-[265px] bg-white border-r border-[#E3E3E3] flex flex-col h-[calc(100vh-64px)] fixed top-16 left-0 z-20">
      {/* Navigator Header */}
      <div className="flex items-center h-[45px] border-b border-[#E3E3E3] flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-[45px] h-[45px] border-r border-[#ECECEC] hover:bg-gray-50 transition-colors"
        >
          <ChevronDown className="w-[22px] h-[22px] text-[#222222] rotate-90" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[12px] font-medium text-black opacity-25">
            Milestones
          </span>
        </div>
        <div className="flex items-center gap-2 px-[10px]">
          <button className="opacity-20 hover:opacity-40 transition-opacity">
            <ChevronDown className="w-[15px] h-[14px] text-[#222222]" />
          </button>
          <button className="flex flex-col gap-[3px] hover:opacity-60 transition-opacity">
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Navigator Content com scroll interno */}
      <div className="flex flex-col gap-[10px] p-[10px] flex-1 overflow-y-auto">
        {/* Milestone Header */}
        <div className="bg-[#FDFBF3] rounded-[8px] p-[4px]">
          <div className="bg-[#E6EFFF] rounded-lg flex items-center w-full h-[34px]">
            <div className="flex items-center justify-center w-[34px] h-full">
              <Circle className="w-[18px] h-[18px] text-[#222]" />
            </div>
            <div className="flex items-center justify-center flex-1 h-full">
              <span className="text-[12px] font-medium text-black">
                {milestone.title}
              </span>
            </div>
          </div>
          <div className="w-full px-2 py-1">
            <div className="flex flex-col gap-1 px-1">
              <p className="text-[10px] font-normal text-[#898989] leading-[1.21]">
                {milestone.description || 'No description'}
              </p>
              <div className="flex gap-2 pb-1">
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Category
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {milestone.category || '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Deadline
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {milestone.deadline || '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Budget
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {milestone.budget || '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center px-1">
              <div className="flex items-center gap-1">
                <button
                  className="w-[25px] h-[25px] flex items-center justify-center bg-[#F4F4F4] rounded-full border border-[#DAE2E8] hover:bg-gray-200 transition-colors"
                  onClick={onAddTask}
                >
                  <Plus className="w-[12px] h-[12px] text-[#222]" />
                </button>
              </div>
              <div className="flex-1"></div>
              <div className="relative">
                <button
                  className="px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border text-blue-700 bg-blue-500 bg-opacity-10 border-opacity-0 hover:border-gray-200 transition"
                  type="button"
                >
                  {milestone.status === 'completed'
                    ? 'Completed'
                    : milestone.status === 'in_progress'
                    ? 'In Progress'
                    : milestone.status === 'pending'
                    ? 'Pending'
                    : 'Cancelled'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Members */}
        <div className="flex items-center gap-1 px-2 py-1">
          {milestone.members?.map((member) => (
            <Avatar
              key={member.id}
              name={member.name}
              avatarUrl={member.avatarUrl}
              size="sm"
            />
          ))}
        </div>
        {/* Milestones List */}
        <div className="flex flex-col mt-2">
          <span className="text-[12px] font-semibold text-gray-700 px-1 mb-1">
            Milestones
          </span>
          <div className="flex flex-col gap-1">
            {milestones.map((m) => (
              <button
                key={m.id}
                className={`flex items-center rounded-lg h-[34px] px-1 hover:bg-gray-50 transition-colors cursor-pointer ${
                  m.id === milestone.id
                    ? 'bg-[#E6EFFF] font-bold'
                    : 'bg-[#F5F5F5]'
                }`}
                onClick={() => m.id !== milestone.id && onSelectMilestone(m.id)}
                disabled={m.id === milestone.id}
              >
                <div className="flex items-center justify-center w-[34px] h-full">
                  {m.status === 'completed' ? (
                    <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                  ) : m.status === 'in_progress' ? (
                    <Clock className="w-[18px] h-[18px] text-blue-500" />
                  ) : m.status === 'pending' ? (
                    <Circle className="w-[18px] h-[18px] text-[#E0E0E0]" />
                  ) : (
                    <Circle className="w-[18px] h-[18px] text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-center flex-1 h-full">
                  <span className="text-[12px] font-medium text-black text-left truncate">
                    {m.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Tasks Section */}
        <div className="flex flex-col mt-4">
          <button
            className="flex items-center gap-2 px-1 py-2 hover:bg-gray-50 transition-colors rounded w-full"
            onClick={() => setTasksOpen((v) => !v)}
          >
            <ChevronDown
              className={`w-[14px] h-[14px] text-[#222] transition-transform ${
                tasksOpen ? '' : '-rotate-90'
              }`}
            />
            <span className="text-[12px] font-medium text-black flex-1 text-left">
              Tasks
            </span>
          </button>
        </div>
        {tasksOpen && (
          <div className="flex flex-col gap-1 px-1 mt-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center rounded-lg h-[34px] hover:bg-gray-50 transition-colors cursor-pointer bg-[#F5F5F5]"
              >
                <div className="flex items-center justify-center w-[34px] h-full">
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="w-[18px] h-[18px] text-blue-500" />
                  ) : (
                    <Circle className="w-[18px] h-[18px] text-[#E0E0E0]" />
                  )}
                </div>
                <div className="flex items-center justify-center flex-1 h-full">
                  <span className="text-[12px] font-medium text-black">
                    {task.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Assets Section */}
        <div className="flex flex-col mt-2">
          <button
            className="flex items-center gap-2 px-1 py-2 hover:bg-gray-50 transition-colors rounded w-full"
            onClick={() => setAssetsOpen((v) => !v)}
          >
            <ChevronDown
              className={`w-[14px] h-[14px] text-[#222] transition-transform ${
                assetsOpen ? '' : '-rotate-90'
              }`}
            />
            <span className="text-[12px] font-medium text-black flex-1 text-left">
              Assets
            </span>
          </button>
        </div>
        {assetsOpen && (
          <div className="flex flex-col gap-1 px-1 mt-2">
            {assets.length === 0 ? (
              <span className="text-[11px] text-gray-400 px-2 py-1">
                No assets
              </span>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center rounded-lg h-[34px] hover:bg-gray-50 transition-colors cursor-pointer bg-[#F5F5F5]"
                >
                  <div className="flex items-center justify-center w-[34px] h-full">
                    {asset.thumbnail ? (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      <Circle className="w-[18px] h-[18px] text-[#E0E0E0]" />
                    )}
                  </div>
                  <div className="flex items-center justify-center flex-1 h-full">
                    <span className="text-[12px] font-medium text-black truncate">
                      {asset.name}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default MilestoneSidebar
