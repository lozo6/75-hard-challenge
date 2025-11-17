import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Mode = 'STRICT' | 'COACH'

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
  date: string // ISO string
  tasks: Record<TaskId, boolean>
}

export interface ChallengeState {
  startedAt: string | null
  mode: Mode
  currentDay: DayState
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

const initialState: ChallengeState = {
  startedAt: null,
  mode: 'STRICT',
  currentDay: {
    dayNumber: 1,
    date: new Date().toISOString(),
    tasks: { ...emptyTasks },
  },
}

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    startChallenge(state, action: PayloadAction<{ mode?: Mode } | undefined>) {
      const mode = action.payload?.mode ?? state.mode
      state.mode = mode
      state.startedAt = new Date().toISOString()
      state.currentDay = {
        dayNumber: 1,
        date: new Date().toISOString(),
        tasks: { ...emptyTasks },
      }
    },
    toggleTask(state, action: PayloadAction<{ taskId: TaskId }>) {
      const { taskId } = action.payload
      state.currentDay.tasks[taskId] = !state.currentDay.tasks[taskId]
    },
    nextDay(state) {
      // later you can enforce 75 max, etc.
      state.currentDay.dayNumber += 1
      state.currentDay.date = new Date().toISOString()
      state.currentDay.tasks = { ...emptyTasks }
    },
    resetChallenge(state) {
      // This is what STRICT mode will call
      state.startedAt = null
      state.currentDay = {
        dayNumber: 1,
        date: new Date().toISOString(),
        tasks: { ...emptyTasks },
      }
    },
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload
    },
  },
})

export const { startChallenge, toggleTask, nextDay, resetChallenge, setMode } =
  challengeSlice.actions

export default challengeSlice.reducer
