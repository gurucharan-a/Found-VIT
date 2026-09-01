export type PostType = "lost" | "found"
export type PostStatus = "open" | "claimed" | "resolved"

export interface GeminiAnalysis {
  category: string
  item: string
  color: string
  brand?: string
  material?: string
  characteristics: string[]
  confidence: number // 0-100
  description: string
}

export interface ModerationResult {
  approved: boolean
  reason?: string // if rejected
  flags: string[]
}

export interface Post {
  id: string
  type: PostType
  title: string
  description: string
  images: string[] // URLs or object URLs
  location: string // VIT location id
  locationLabel: string
  createdAt: string // ISO
  author: { name: string; avatar: string; handle: string }
  status: PostStatus
  analysis?: GeminiAnalysis
  moderation?: ModerationResult
  contactCount?: number
}

export interface User {
  name: string
  handle: string
  avatar: string
  hostel: string
}
