import type { BoardDetail, BoardSummary, Moment } from './types'

const API_BASE = ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function uploadMoment(file: File, caption?: string): Promise<Moment> {
  const form = new FormData()
  form.append('file', file)
  if (caption?.trim()) {
    form.append('caption', caption.trim())
  }
  return request<Moment>('/api/moments', {
    method: 'POST',
    body: form,
  })
}

export function likeMoment(id: string): Promise<Moment> {
  return request<Moment>(`/api/moments/${id}/like`, { method: 'POST' })
}

export function getRecentMoments(): Promise<Moment[]> {
  return request<Moment[]>('/api/moments/recent')
}

export function getBoards(): Promise<BoardSummary[]> {
  return request<BoardSummary[]>('/api/boards')
}

export function getBoard(id: string): Promise<BoardDetail> {
  return request<BoardDetail>(`/api/boards/${id}`)
}
