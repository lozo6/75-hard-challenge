'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  startChallenge,
  toggleTask,
  nextDay,
  resetChallenge,
  setMode,
  TaskId,
} from '@/features/challenge/challengeSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useMemo } from 'react'

const TASK_LABELS: Record<TaskId, string> = {
  workout1: 'Workout 1 (45 min)',
  workout2: 'Workout 2 (45 min, must be outdoors)',
  diet: 'Follow your diet',
  no_alcohol: 'No alcohol / cheat meals',
  reading: 'Read 10 pages (non-fiction)',
  progress_pic: 'Take a progress picture',
  water: 'Drink 1 gallon of water',
}

export default function HomePage() {
  const dispatch = useAppDispatch()
  const challenge = useAppSelector((state) => state.challenge)

  const completionPercent = useMemo(() => {
    const tasks = challenge.currentDay.tasks
    const values = Object.values(tasks)
    const completed = values.filter(Boolean).length
    return (completed / values.length) * 100
  }, [challenge.currentDay.tasks])

  const handleStart = () => {
    dispatch(startChallenge({ mode: challenge.mode }))
  }

  const handleToggleTask = (taskId: TaskId) => {
    dispatch(toggleTask({ taskId }))
  }

  const handleNextDay = () => {
    dispatch(nextDay())
  }

  const handleReset = () => {
    dispatch(resetChallenge())
  }

  const handleModeToggle = (checked: boolean) => {
    dispatch(setMode(checked ? 'STRICT' : 'COACH'))
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">75 Hard Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Simple daily checklist with Strict / Coach modes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground">
            Mode: {challenge.mode === 'STRICT' ? 'Strict' : 'Coach'}
          </span>
          <Switch
            checked={challenge.mode === 'STRICT'}
            onCheckedChange={handleModeToggle}
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            Day {challenge.currentDay.dayNumber}{' '}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {challenge.startedAt ? 'In progress' : 'Not started'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!challenge.startedAt && (
            <Button onClick={handleStart} className="w-full">
              Start 75 Hard
            </Button>
          )}

          {challenge.startedAt && (
            <>
              <div className="space-y-3">
                {Object.entries(challenge.currentDay.tasks).map(
                  ([id, value]) => {
                    const taskId = id as TaskId
                    return (
                      <label
                        key={taskId}
                        className="flex items-center gap-3 rounded-md border p-2 hover:bg-muted"
                      >
                        <Checkbox
                          checked={value}
                          onCheckedChange={() => handleToggleTask(taskId)}
                        />
                        <span className="text-sm">{TASK_LABELS[taskId]}</span>
                      </label>
                    )
                  },
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Completion</span>
                  <span>{Math.round(completionPercent)}%</span>
                </div>
                <Progress value={completionPercent} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Reset (fail day)
                </Button>
                <Button className="flex-1" onClick={handleNextDay}>
                  Next Day
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
