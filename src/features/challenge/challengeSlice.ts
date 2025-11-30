import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Mode = 'HARD' | 'SOFT'
export type TaskId = string

export interface TaskDefinition {
  id: TaskId
  label: string
  mode: Mode
}

export interface DayState {
  dayNumber: number
  date: string // ISO string
  tasks: Record<TaskId, boolean>
  reflection: string
}

export interface ChallengeState {
  startedAt: string | null
  mode: Mode
  currentDay: DayState
  history?: DayState[] // previous days (local-only)
  taskDefinitions: Record<Mode, TaskDefinition[]>
}

// ---- Default tasks per mode ----

const DEFAULT_TASKS: Record<Mode, TaskDefinition[]> = {
  HARD: [
    {
      id: 'hard_diet_strict',
      label: 'Follow a strict diet (no cheat meals, no alcohol)',
      mode: 'HARD',
    },
    {
      id: 'hard_workout_1',
      label: '45-minute workout #1',
      mode: 'HARD',
    },
    {
      id: 'hard_workout_2_outdoor',
      label: '45-minute workout #2 (must be outdoors)',
      mode: 'HARD',
    },
    {
      id: 'hard_water_1gallon',
      label: 'Drink 1 gallon of water',
      mode: 'HARD',
    },
    {
      id: 'hard_reading_nonfiction',
      label: 'Read 10 pages (non-fiction)',
      mode: 'HARD',
    },
    {
      id: 'hard_progress_pic',
      label: 'Take a progress picture',
      mode: 'HARD',
    },
  ],
  SOFT: [
    {
      id: 'soft_workout_daily',
      label: 'One 45-min workout (1 weekly active rest day allowed)',
      mode: 'SOFT',
    },
    {
      id: 'soft_diet_flexible',
      label:
        'Eat well / healthy diet (alcohol allowed on social occasions)',
      mode: 'SOFT',
    },
    {
      id: 'soft_water_3l',
      label: 'Drink 3L of water',
      mode: 'SOFT',
    },
    {
      id: 'soft_reading_any',
      label: 'Read 10 pages (any book)',
      mode: 'SOFT',
    },
  ],
}

const makeNewDay = (
  dayNumber: number,
  mode: Mode,
  taskDefinitions: Record<Mode, TaskDefinition[]>,
): DayState => {
  const tasks: Record<TaskId, boolean> = {}
  for (const task of taskDefinitions[mode]) {
    tasks[task.id] = false
  }

  return {
    dayNumber,
    date: new Date().toISOString(),
    tasks,
    reflection: '',
  }
}

const initialState: ChallengeState = {
  startedAt: null,
  mode: 'HARD',
  taskDefinitions: {
    HARD: DEFAULT_TASKS.HARD,
    SOFT: DEFAULT_TASKS.SOFT,
  },
  currentDay: makeNewDay(1, 'HARD', {
    HARD: DEFAULT_TASKS.HARD,
    SOFT: DEFAULT_TASKS.SOFT,
  }),
  history: [],
}

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    hydrate(_state, action: PayloadAction<ChallengeState | undefined>) {
      if (!action.payload) return _state
      const payload = action.payload

      // Migrate old modes if they exist (STRICT/COACH -> HARD/SOFT)
      let rawMode = (payload.mode as unknown) as Mode | 'STRICT' | 'COACH'
      if (rawMode === 'STRICT') rawMode = 'HARD'
      if (rawMode === 'COACH') rawMode = 'SOFT'
      const mode: Mode = rawMode === 'SOFT' ? 'SOFT' : 'HARD'

      // If old state had no taskDefinitions, fall back to defaults
      const taskDefinitions =
        (payload as any).taskDefinitions && Object.keys((payload as any).taskDefinitions).length
          ? payload.taskDefinitions
          : {
              HARD: DEFAULT_TASKS.HARD,
              SOFT: DEFAULT_TASKS.SOFT,
            }

      const history = payload.history ?? []

      // Rebuild currentDay tasks based on definitions, keep dayNumber & reflection
      const dayNumber = payload.currentDay?.dayNumber ?? 1
      const reflection = payload.currentDay?.reflection ?? ''
      const rebuiltDay = makeNewDay(dayNumber, mode, taskDefinitions)
      rebuiltDay.reflection = reflection

      return {
        startedAt: payload.startedAt ?? null,
        mode,
        taskDefinitions,
        currentDay: rebuiltDay,
        history,
      }
    },

    startChallenge(state, action: PayloadAction<{ mode?: Mode } | undefined>) {
      const mode = action.payload?.mode ?? state.mode
      state.mode = mode
      state.startedAt = new Date().toISOString()
      state.currentDay = makeNewDay(1, mode, state.taskDefinitions)
      // History is kept so they can see previous runs
    },

    toggleTask(state, action: PayloadAction<{ taskId: TaskId }>) {
      const { taskId } = action.payload
      const current = state.currentDay.tasks[taskId] ?? false
      state.currentDay.tasks[taskId] = !current
    },

    setReflection(state, action: PayloadAction<{ text: string }>) {
      state.currentDay.reflection = action.payload.text
    },

    nextDay(state) {
      const history = state.history ?? []
      history.push(state.currentDay)
      state.history = history
      state.currentDay = makeNewDay(
        state.currentDay.dayNumber + 1,
        state.mode,
        state.taskDefinitions,
      )
    },

    resetChallenge(state) {
      state.startedAt = null
      state.currentDay = makeNewDay(1, state.mode, state.taskDefinitions)
    },

    setMode(state, action: PayloadAction<Mode>) {
      const newMode = action.payload
      state.mode = newMode

      // If challenge hasn't started yet, update the day to match this mode's tasks
      if (!state.startedAt) {
        state.currentDay = makeNewDay(1, newMode, state.taskDefinitions)
      }
    },

    clearHistory(state) {
      state.history = []
    },

    addTask(
      state,
      action: PayloadAction<{ mode: Mode; label: string }>,
    ) {
      const { mode, label } = action.payload
      const id: TaskId = `task_${mode.toLowerCase()}_${Date.now()}`

      const def: TaskDefinition = {
        id,
        label,
        mode,
      }

      state.taskDefinitions[mode] = [
        ...state.taskDefinitions[mode],
        def,
      ]

      // If user is currently in this mode, add to current day's tasks
      if (state.mode === mode) {
        state.currentDay.tasks[id] = false
      }
    },

    updateTaskLabel(
      state,
      action: PayloadAction<{ mode: Mode; id: TaskId; label: string }>,
    ) {
      const { mode, id, label } = action.payload
      state.taskDefinitions[mode] = state.taskDefinitions[mode].map((t) =>
        t.id === id ? { ...t, label } : t,
      )
    },

    removeTask(
      state,
      action: PayloadAction<{ mode: Mode; id: TaskId }>,
    ) {
      const { mode, id } = action.payload
      state.taskDefinitions[mode] = state.taskDefinitions[mode].filter(
        (t) => t.id !== id,
      )

      if (state.mode === mode) {
        delete state.currentDay.tasks[id]
      }
    },

    resetTasksForMode(state, action: PayloadAction<{ mode: Mode }>) {
      const { mode } = action.payload
      state.taskDefinitions[mode] = DEFAULT_TASKS[mode]

      // If currently in this mode, rebuild current day for this mode
      if (state.mode === mode) {
        const dayNumber = state.currentDay.dayNumber
        const reflection = state.currentDay.reflection
        const rebuilt = makeNewDay(dayNumber, mode, state.taskDefinitions)
        rebuilt.reflection = reflection
        state.currentDay = rebuilt
      }
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
  addTask,
  updateTaskLabel,
  removeTask,
  resetTasksForMode,
} = challengeSlice.actions

export default challengeSlice.reducer

// test1