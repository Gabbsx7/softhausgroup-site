// Mock data for Client Dashboard based on Figma design

export interface MockProject {
  id: string
  name: string
  client: string
  description: string
  category: string
  deadline: string
  budget: string
  status: 'in_progress' | 'approved' | 'pending'
  team: MockTeamMember[]
  isActive: boolean
}

export interface MockTeamMember {
  id: string
  name: string
  avatar: string
}

export interface MockFolder {
  id: string
  name: string
  foldersCount: number
  assetsCount: number
}

export interface MockAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'pdf'
  thumbnail: string
  approvals: MockTeamMember[]
  denials: MockTeamMember[]
}

export interface MockCollection {
  id: string
  title: string
  description: string
  type: 'visual' | 'folder'
  backgroundImage?: string
  folders?: MockFolder[]
}

// Team Members
export const mockTeamMembers: MockTeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
]

// Projects Data (following Figma design)
export const mockProjects: MockProject[] = [
  {
    id: '1',
    name: 'A cool Branding Project',
    client: 'CGI',
    description:
      'Currently in production a CGI video for FootlockerFootlockerFootlockerFootlocker featuring',
    category: 'CGI',
    deadline: '14 April, 2025',
    budget: '$4,000',
    status: 'in_progress',
    team: mockTeamMembers,
    isActive: true,
  },
]

// Collections Data
export const mockCollections: MockCollection[] = [
  {
    id: 'a-collection',
    title: 'A Collection',
    description: 'A custom Folder preview',
    type: 'visual',
    backgroundImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'b-collection',
    title: 'B Collection',
    description: 'Organized folder structure',
    type: 'folder',
    folders: [
      {
        id: '1',
        name: 'Folder Name',
        foldersCount: 2,
        assetsCount: 4,
      },
      {
        id: '2',
        name: 'Folder Name 2',
        foldersCount: 0,
        assetsCount: 4,
      },
    ],
  },
]

// Assets Data
export const mockAssets: MockAsset[] = [
  {
    id: '1',
    name: 'Image_01.jpg',
    type: 'image',
    thumbnail:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop',
    approvals: [mockTeamMembers[0], mockTeamMembers[1]],
    denials: [mockTeamMembers[2]],
  },
  {
    id: '2',
    name: 'Image_02.jpg',
    type: 'image',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    approvals: [mockTeamMembers[0], mockTeamMembers[1]],
    denials: [mockTeamMembers[2]],
  },
  {
    id: '3',
    name: 'Video_01.mp4',
    type: 'video',
    thumbnail:
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=200&fit=crop',
    approvals: [mockTeamMembers[0], mockTeamMembers[1]],
    denials: [mockTeamMembers[2]],
  },
  {
    id: '4',
    name: 'PDF_01.pdf',
    type: 'pdf',
    thumbnail:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="rgba(255,255,255,0.2)"><rect width="300" height="200" fill="%23f8f8f8"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14">PDF Document</text></svg>',
    approvals: [mockTeamMembers[0], mockTeamMembers[1]],
    denials: [mockTeamMembers[2]],
  },
]

// Asset filters
export const assetFilters = [
  { id: 'all', name: 'All', active: true },
  { id: 'images', name: 'Images', active: false },
  { id: 'videos', name: 'Videos', active: false },
  { id: 'pdf', name: 'PDF', active: false },
]
