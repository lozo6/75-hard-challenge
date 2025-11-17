'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from '@/lib/store'
import {
  hydrate,
  type ChallengeState,
} from '@/features/challenge/challengeSlice'

const STORAGE_KEY = 'challengeState'

export default function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  const [ready, setReady] = useState(false)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  useEffect(() => {
    const store = storeRef.current!

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ChallengeState
        store.dispatch(hydrate(parsed))
      }
    } catch (err) {
      console.error('Failed to load challenge state from localStorage', err)
    }

    const unsubscribe = store.subscribe(() => {
      const state = store.getState().challenge
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.error('Failed to save challenge state to localStorage', err)
      }
    })

    setReady(true)

    return () => {
      unsubscribe()
    }
  }, [])

  if (!ready) {
    return <div className="min-h-screen bg-background" />
  }

  return <Provider store={storeRef.current!}>{children}</Provider>
}
