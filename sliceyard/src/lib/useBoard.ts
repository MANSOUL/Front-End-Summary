import { useSyncExternalStore } from 'react'
import { board } from './store'

export function useBoard() {
  return useSyncExternalStore(board.subscribe, board.getState, board.getState)
}
