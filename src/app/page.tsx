'use client'

import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  startChallenge,
  toggleTask,
  nextDay,
  resetChallenge,
  setMode,
  setReflection,
  clearHistory,
  addTask,
  removeTask,
  resetTasksForMode,
  type DayState,
  type TaskId,
} from '@/features/challenge/challengeSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const getCompletionPercent = (day: DayState): number => {
  const values = Object.values(day.tasks ?? {})
  if (values.length === 0) return 0
  const completed = values.filter(Boolean).length
  return (completed / values.length) * 100
}

export default function HomePage() {
  const dispatch = useAppDispatch()
  const challenge = useAppSelector((state) => state.challenge)
  const history = challenge.history ?? []
  const tasksForMode = challenge.taskDefinitions[challenge.mode] ?? []

  const completionPercent = useMemo(
    () => getCompletionPercent(challenge.currentDay),
    [challenge.currentDay],
  )

  const modeLabel = challenge.mode === 'HARD' ? 'Hard' : 'Soft'
  const hasStarted = Boolean(challenge.startedAt)
  const canEditTasks = !hasStarted

  const [newTaskLabel, setNewTaskLabel] = useState('')

  const handleStart = () => {
    dispatch(startChallenge({ mode: challenge.mode }))
  }

  const handleToggleTask = (taskId: TaskId) => {
    dispatch(toggleTask({ taskId }))
  }

  const handleNextDay = () => {
    const pct = getCompletionPercent(challenge.currentDay)

    if (challenge.mode === 'HARD' && pct < 100) {
      const confirmed = window.confirm(
        'You are in Hard mode. Moving on without completing all tasks means restarting at Day 1, per 75 Hard rules. Do you want to restart?',
      )
      if (confirmed) {
        dispatch(resetChallenge())
      }
      return
    }

    dispatch(nextDay())
  }

  const handleReset = () => {
    const confirmed = window.confirm(
      'This will reset you to Day 1. Your task configuration stays the same, but you will lose your current progress. Continue?',
    )
    if (confirmed) {
      dispatch(resetChallenge())
    }
  }

  const handleModeToggle = (checked: boolean) => {
    // Switch ON = Hard, OFF = Soft
    dispatch(setMode(checked ? 'HARD' : 'SOFT'))
  }

  const handleReflectionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    dispatch(setReflection({ text: e.target.value }))
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all past days from this device?')) {
      dispatch(clearHistory())
    }
  }

  const handleRemoveTask = (id: TaskId) => {
    if (!canEditTasks) return
    // Removed confirmation dialog for smoother UX
    dispatch(removeTask({ mode: challenge.mode, id }))
  }

  const handleAddTask = () => {
    if (!canEditTasks) return
    const label = newTaskLabel.trim()
    if (!label) return

    dispatch(
      addTask({
        mode: challenge.mode,
        label,
      }),
    )

    setNewTaskLabel('')
  }

  const handleResetTasksForMode = () => {
    if (!canEditTasks) return
    const confirmed = window.confirm(
      `Reset tasks for ${modeLabel} mode back to defaults? This will reset today's tasks for this mode.`,
    )
    if (confirmed) {
      dispatch(resetTasksForMode({ mode: challenge.mode }))
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">75 Challenge Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Simple daily checklist with Hard / Soft modes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground">
            Mode: {modeLabel}
          </span>
          <Switch
            checked={challenge.mode === 'HARD'}
            onCheckedChange={handleModeToggle}
          />
        </div>
      </header>

      {/* Current day card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Day {challenge.currentDay.dayNumber}{' '}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {hasStarted ? 'In progress' : 'Not started'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasStarted && (
            <Button onClick={handleStart} className="w-full">
              Start 75 {modeLabel}
            </Button>
          )}

          {hasStarted && (
            <>
              {/* Tasks */}
              <div className="space-y-3">
                {tasksForMode.map((task) => {
                  const value = challenge.currentDay.tasks[task.id] ?? false
                  return (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 rounded-md border p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={value}
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <span className="text-sm">{task.label}</span>
                    </label>
                  )
                })}

                {tasksForMode.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No tasks configured for this mode. Use the customization
                    section below to add tasks.
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Completion</span>
                  <span>{Math.round(completionPercent)}%</span>
                </div>
                <Progress value={completionPercent} />
              </div>

              {/* Daily reflection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Daily reflection (optional)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    A few sentences about how today went.
                  </span>
                </div>
                <Textarea
                  value={challenge.currentDay.reflection}
                  onChange={handleReflectionChange}
                  placeholder="How did today go? What was hardest? What are you proud of?"
                  className="min-h-24 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Reset to Day 1
                </Button>
                <Button className="flex-1" onClick={handleNextDay}>
                  Next Day
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Customize tasks for current mode */}
      <Card
        className={
          hasStarted ? 'opacity-70 transition-opacity' : 'transition-opacity'
        }
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Customize tasks ({modeLabel} mode)
            </CardTitle>
            {hasStarted && (
              <p className="text-xs text-muted-foreground">
                Locked after starting. Reset to Day 1 to change tasks.
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!hasStarted && (
            <>
              {/* Add task inline input */}
              <div className="flex gap-2">
                <Input
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  placeholder={`Add a ${modeLabel.toLowerCase()} task...`}
                  className="h-10 text-sm"
                />
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={handleAddTask}
                  disabled={!newTaskLabel.trim()}
                >
                  Add
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 text-xs text-muted-foreground"
                  onClick={handleResetTasksForMode}
                >
                  Reset defaults
                </Button>
              </div>

              {tasksForMode.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tasks configured yet. Add tasks or reset to defaults.
                </p>
              )}

              {tasksForMode.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2"
                >
                  {/* READ-ONLY TASK LABEL */}
                  <div className="flex-1 flex items-center min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    {task.label}
                  </div>

                  {/* DELETE BUTTON */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveTask(task.id)}
                    aria-label="Remove task"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Past days (on this device)</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={handleClearHistory}
            >
              Clear history
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {history
              .slice()
              .reverse()
              .map((day) => {
                const pct = Math.round(getCompletionPercent(day))
                const date = new Date(day.date).toLocaleDateString()
                const snippet =
                  day.reflection.trim().length > 0
                    ? day.reflection.trim().slice(0, 80) +
                      (day.reflection.trim().length > 80 ? '…' : '')
                    : 'No reflection added.'

                return (
                  <div
                    key={`${day.dayNumber}-${day.date}`}
                    className="space-y-1 rounded-md border p-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Day {day.dayNumber}{' '}
                        <span className="text-xs text-muted-foreground">
                          ({date})
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pct}% complete
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{snippet}</p>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
