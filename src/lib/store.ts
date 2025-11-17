import { configureStore } from '@reduxjs/toolkit'
import challengeReducer from '@/features/challenge/challengeSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      challenge: challengeReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
