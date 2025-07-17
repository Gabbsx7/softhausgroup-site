export { useAssets } from './use-assets'
export { useClientData } from './use-client-data'
export { useProjectDetails } from './use-project-data'
export { useMilestoneData } from './use-milestone-data'

// Re-export from packages
export * from '../../../packages/hooks/src'

// Explicit exports to ensure they're available
export { useChatAdvanced } from '../../../packages/hooks/src/use-chat-advanced'
export { useNotifications } from '../../../packages/hooks/src/use-notifications'
export { useClientSidebar } from '../../../packages/hooks/src/use-client-sidebar'
export { useRealtimeChat } from '../../../packages/hooks/src/use-realtime-chat'
export { useSupabase } from '../../../packages/hooks/src/use-supabase'
export type {
  SidebarProject,
  SidebarCollection,
  SidebarAsset,
  SidebarFolder,
  SidebarMilestone,
  SidebarTask,
  SidebarNavigationItem,
} from '../../../packages/hooks/src/use-client-sidebar'
export type { ChatMessage } from '../../../packages/hooks/src/use-realtime-chat'
