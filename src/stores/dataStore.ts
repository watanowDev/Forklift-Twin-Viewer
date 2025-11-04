import { create } from 'zustand'
import type { ActionEvent } from '../types'

interface DataStore {
  actionEvents: ActionEvent[]
  addActionEvent: (event: ActionEvent) => void
  clearActionEvents: () => void
}

export const useDataStore = create<DataStore>((set) => ({
  actionEvents: [],

  addActionEvent: (event: ActionEvent) => {
    set((state) => ({
      actionEvents: [...state.actionEvents.slice(-99), event], // Keep last 100
    }))
  },

  clearActionEvents: () => {
    set({ actionEvents: [] })
  },
}))
