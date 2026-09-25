export type MomentStatus = 'PENDING' | 'PROCESSED' | 'FAILED'

export interface Moment {
  id: string
  imageUrl: string
  userCaption: string | null
  status: MomentStatus
  likeCount: number
  createdAt: string
}

export interface BoardSummary {
  id: string
  name: string | null
  memberCount: number
  previewImageUrls: string[]
  createdAt: string
}

export interface BoardDetail {
  id: string
  name: string | null
  memberCount: number
  members: Moment[]
}

export type AppView = 'shared-space' | 'vibe-board'
