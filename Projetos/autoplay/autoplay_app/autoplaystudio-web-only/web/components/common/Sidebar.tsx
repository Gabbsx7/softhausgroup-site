'use client'

import React, { useState } from 'react'
import {
  Compass,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Menu,
} from 'lucide-react'
import {
  useStudioDashboard,
  StudioDashboardClient,
  StudioDashboardProject,
} from '../../hooks/use-studio-dashboard'
import { useTemplates, Template } from '../../hooks/use-templates'
import { EmptyState } from './EmptyState'

interface SidebarProps {
  className?: string
}

// Collection Bar Component
function CollectionBar({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {children}
    </div>
  )
}

// Expanded Content Components
function ClientsContent() {
  const { clients, loading } = useStudioDashboard()

  if (loading) {
    return (
      <div className="px-8 py-2">
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    )
  }

  if (clients.length === 0) {
    return <EmptyState type="clients" />
  }

  return (
    <div className="px-8 py-2 space-y-2">
      {clients.map((client: StudioDashboardClient) => (
        <div key={client.client_id} className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {client.client_name.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-700">{client.client_name}</span>
        </div>
      ))}
    </div>
  )
}

function ProjectsContent() {
  const { projects, loading } = useStudioDashboard()

  if (loading) {
    return (
      <div className="px-8 py-2">
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyState type="projects" />
  }

  return (
    <div className="px-8 py-2 space-y-2">
      {projects.map((project: StudioDashboardProject) => (
        <div key={project.project_id} className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {project.project_name.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-700">{project.project_name}</span>
        </div>
      ))}
    </div>
  )
}

function MembersContent() {
  const { data, loading } = useStudioDashboard()
  const [expandedClients, setExpandedClients] = useState<string[]>([])

  if (loading) {
    return (
      <div className="px-8 py-2">
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    )
  }

  if (!data) {
    return <EmptyState type="members" />
  }

  // Extrair membros do studio da view
  const studioMembers = data.studio_members || []

  // Extrair membros dos clients da view
  const clientMembers: any[] = []
  const clientMembersByClient: Record<
    string,
    { client_name: string; members: any[] }
  > = {}

  if (data.clients) {
    data.clients.forEach((client: any) => {
      if (client.client_members && client.client_members.length > 0) {
        clientMembersByClient[client.client_id] = {
          client_name: client.client_name,
          members: client.client_members.filter(
            (member: any) => member.user_id
          ), // Filtrar membros válidos
        }

        client.client_members.forEach((member: any) => {
          if (member.user_id) {
            clientMembers.push({
              ...member,
              client_id: client.client_id,
              client_name: client.client_name,
            })
          }
        })
      }
    })
  }

  if (studioMembers.length === 0 && clientMembers.length === 0) {
    return <EmptyState type="members" />
  }

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    )
  }

  return (
    <div className="px-8 py-2 space-y-2">
      {/* Membros do Studio */}
      {studioMembers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Studio
          </div>
          {studioMembers.map((member: any) => (
            <div
              key={member.studio_member_id}
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-green-600">
                  {(member.user_name || 'U').charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-700">
                  {member.user_name || 'Nome não disponível'}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({member.role_name || 'Sem role'})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Membros dos Clients */}
      {Object.keys(clientMembersByClient).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Clients
          </div>
          {Object.entries(clientMembersByClient).map(
            ([clientId, clientData]) => (
              <div key={clientId} className="space-y-1">
                <button
                  onClick={() => toggleClientExpansion(clientId)}
                  className="flex items-center space-x-2 w-full text-left hover:bg-gray-50 p-1 rounded"
                >
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedClients.includes(clientId) ? 'rotate-90' : ''
                    }`}
                  />
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {clientData.client_name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {clientData.client_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({clientData.members.length})
                  </span>
                </button>

                {expandedClients.includes(clientId) && (
                  <div className="ml-6 space-y-1">
                    {clientData.members.map((member: any) => (
                      <div
                        key={member.client_user_id}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {(member.user_name || 'U').charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">
                            {member.user_name || 'Nome não disponível'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({member.role_name || 'Sem role'})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

function TemplatesContent() {
  const { templates, loading } = useTemplates()

  if (loading) {
    return (
      <div className="px-8 py-2">
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    )
  }

  if (templates.length === 0) {
    return <EmptyState type="templates" />
  }

  return (
    <div className="px-8 py-2 space-y-2">
      {templates.map((template: Template) => (
        <div key={template.id} className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-purple-600">
              {template.name.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-700">{template.name}</span>
        </div>
      ))}
    </div>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  return (
    <div className={`w-64 bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Navigator</span>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto">
        <CollectionBar
          title="Clients"
          isExpanded={expandedSections.includes('clients')}
          onToggle={() => toggleSection('clients')}
        >
          {expandedSections.includes('clients') && <ClientsContent />}
        </CollectionBar>

        <CollectionBar
          title="Projects"
          isExpanded={expandedSections.includes('projects')}
          onToggle={() => toggleSection('projects')}
        >
          {expandedSections.includes('projects') && <ProjectsContent />}
        </CollectionBar>

        <CollectionBar
          title="Members"
          isExpanded={expandedSections.includes('members')}
          onToggle={() => toggleSection('members')}
        >
          {expandedSections.includes('members') && <MembersContent />}
        </CollectionBar>

        <CollectionBar
          title="Templates"
          isExpanded={expandedSections.includes('templates')}
          onToggle={() => toggleSection('templates')}
        >
          {expandedSections.includes('templates') && <TemplatesContent />}
        </CollectionBar>
      </div>
    </div>
  )
}
