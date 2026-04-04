export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  createdAt: string
  readBy: string[]
  reactions?: Record<string, string[]>
}

export interface ChatRoom {
  id: string
  name: string
  type: 'group' | 'direct'
  participants: string[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  avatar?: string
}

export type DashboardNavId = 'home' | 'tasks' | 'calendar' | 'team' | 'chat' | 'profile'

export interface OcStatistics {
  teamStats: {
    totalMembers: number
    activeMembers: number
    pendingInvites: number
    onLeave: number
    taskCompletion: number
  }
  taskStats: { total: number; completed: number; inProgress: number; overdue: number }
  eventStats: { total: number; upcoming: number; past: number }
}
