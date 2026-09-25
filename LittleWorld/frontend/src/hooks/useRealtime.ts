import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { BoardSummary, Moment } from '../types'

interface UseRealtimeOptions {
  onMoment: (moment: Moment) => void
  onBoard: (board: BoardSummary) => void
}

/**
 * STOMP over SockJS — proxied via Vite to http://localhost:8080/ws in dev.
 */
export function useRealtime({ onMoment, onBoard }: UseRealtimeOptions) {
  const onMomentRef = useRef(onMoment)
  const onBoardRef = useRef(onBoard)

  useEffect(() => {
    onMomentRef.current = onMoment
    onBoardRef.current = onBoard
  })

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe('/topic/space', (message) => {
          try {
            const moment = JSON.parse(message.body) as Moment
            onMomentRef.current(moment)
          } catch {
            /* ignore malformed payloads */
          }
        })
        client.subscribe('/topic/boards', (message) => {
          try {
            const board = JSON.parse(message.body) as BoardSummary
            onBoardRef.current(board)
          } catch {
            /* ignore malformed payloads */
          }
        })
      },
    })

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [])
}
