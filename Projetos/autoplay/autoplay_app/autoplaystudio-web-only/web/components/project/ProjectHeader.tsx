import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Palette } from 'lucide-react'

interface ProjectHeaderProps {
  name: string
  description: string
}

export function ProjectHeader({ name }: ProjectHeaderProps) {
  const params = useParams()
  const projectId = params?.projectId as string
  const clientId = params?.clientId as string

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 font-inter">
          {name}
        </h1>

        {/* Design Room Button */}
        <Link
          href={`/dashboard/client/${clientId}/project/${projectId}/design-room-ui`}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Palette className="w-4 h-4" />
          <span>Design Room</span>
        </Link>
      </div>
    </div>
  )
}
