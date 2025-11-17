import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Mode = 'HARD' | 'SOFT'

export type TaskId =
  | 'workout1'
  | 'workout2'
  | 'diet'
  | 'no_alcohol'
  | 'reading'
  | 'progress_pic'
  | 'water'

export interface DayState {
  dayNumber: number
  date: string
  tasks: Record<TaskId, boolean>
  reflection: string
}

export interface ChallengeState {
  startedAt: string | null
  mode: Mode
  currentDay: DayState
  history?: DayState[]
}

const emptyTasks: Record<TaskId, boolean> = {
  workout1: false,
  workout2: false,
  diet: false,
  no_alcohol: false,
  reading: false,
  progress_pic: false,
  water: false,
}

const makeNewDay = (dayNumber: number): DayState => ({
  dayNumber,
  date: new Date().toISOString(),
  tasks: { ...emptyTasks },
  reflection: '',
})

const initialState: ChallengeState = {
  startedAt: null,
  mode: 'HARD',
  currentDay: makeNewDay(1),
  history: [],
}

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    hydrate(_state, action: PayloadAction<ChallengeState | undefined>) {
      if (!action.payload) return _state
      const payload = action.payload

      // Migrate old 'STRICT' / 'COACH' modes if they exist in localStorage
      let mode = (payload.mode as unknown) as Mode | 'STRICT' | 'COACH'
      if (mode === 'STRICT') mode = 'HARD'
      if (mode === 'COACH') mode = 'SOFT'

      return {
        ...payload,
        mode,
        history: payload.history ?? [],
      }
    },
    startChallenge(state, action: PayloadAction<{ mode?: Mode } | undefined>) {
      const mode = action.payload?.mode ?? state.mode
      state.mode = mode
      state.startedAt = new Date().toISOString()
      state.currentDay = makeNewDay(1)
    },
    toggleTask(state, action: PayloadAction<{ taskId: TaskId }>) {
      const { taskId } = action.payload
      state.currentDay.tasks[taskId] = !state.currentDay.tasks[taskId]
    },
    setReflection(state, action: PayloadAction<{ text: string }>) {
      state.currentDay.reflection = action.payload.text
    },
    nextDay(state) {
      const history = state.history ?? []
      history.push(state.currentDay)
      state.history = history
      state.currentDay = makeNewDay(state.currentDay.dayNumber + 1)
    },
    resetChallenge(state) {
      state.startedAt = null
      state.currentDay = makeNewDay(1)
    },
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload
    },
    clearHistory(state) {
      state.history = []
    },
  },
})

export const {
  hydrate,
  startChallenge,
  toggleTask,
  setReflection,
  nextDay,
  resetChallenge,
  setMode,
  clearHistory,
} = challengeSlice.actions

export default challengeSlice.reducer
