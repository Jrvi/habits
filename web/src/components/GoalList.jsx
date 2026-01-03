import { useState, useEffect } from 'react'
import goalsService from '../services/goals'
import completionsService from '../services/completions'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import Togglable from './Togglable'
import { t } from '../i18n/translations.js'

const GoalList = ({ habits = [] }) => {
  const [goals, setGoals] = useState([])
  const currentYear = new Date().getFullYear()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [yearCompletions, setYearCompletions] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  useEffect(() => {
    fetchYearCompletions()

    const onCompletionChange = (event) => {
      const detail = event?.detail
      if (!detail || !detail.habitId || !detail.date) return

      // Only track current year
      if (!String(detail.date).startsWith(String(currentYear))) return

      if (detail.completed) {
        const completedDate = detail.completion?.completed_date || detail.date
        setYearCompletions((prev) => {
          const exists = prev.some((c) => {
            const dateStr = new Date(c.completed_date).toISOString().split('T')[0]
            return c.habit_id === detail.habitId && dateStr === detail.date
          })
          if (exists) return prev
          return prev.concat({ habit_id: detail.habitId, completed_date: completedDate })
        })
      } else {
        setYearCompletions((prev) =>
          prev.filter((c) => {
            const dateStr = new Date(c.completed_date).toISOString().split('T')[0]
            return !(c.habit_id === detail.habitId && dateStr === detail.date)
          })
        )
      }
    }

    window.addEventListener('habitisti:completionchange', onCompletionChange)
    return () => window.removeEventListener('habitisti:completionchange', onCompletionChange)
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await goalsService.getByYear(currentYear)
      // Varmistetaan että data on aina array
      if (Array.isArray(data)) {
        setGoals(data)
      } else {
        setGoals([])
      }
    } catch (err) {
      setError(`${t('errorFetchingGoals')}: ${err.message}`)
      console.error('Error fetching goals:', err)
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchYearCompletions = async () => {
    setLoadingProgress(true)
    try {
      const start = `${currentYear}-01-01`
      const end = new Date().toISOString().slice(0, 10)
      const data = await completionsService.getUserCompletions(start, end)
      setYearCompletions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching year completions:', err)
      setYearCompletions([])
    } finally {
      setLoadingProgress(false)
    }
  }

  const daysElapsedThisYear = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diffMs = now.getTime() - start.getTime()
    return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1
  })()

  const getGoalStats = (goalId) => {
    const goalHabits = habits.filter((h) => h.goal_id === goalId)
    const habitIds = new Set(goalHabits.map((h) => h.id))
    const habitCount = goalHabits.length
    if (habitCount === 0) {
      return { habitCount: 0, completions: 0, possible: 0, percent: 0 }
    }

    const completionCount = yearCompletions.filter((c) => habitIds.has(c.habit_id)).length
    const possible = habitCount * daysElapsedThisYear
    const percent = possible > 0 ? Math.round((completionCount / possible) * 100) : 0

    return { habitCount, completions: completionCount, possible, percent }
  }

  const handleGoalCreated = (newGoal) => {
    setGoals([...goals, newGoal])
  }

  const handleGoalUpdated = (updatedGoal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  const handleGoalDeleted = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId))
  }

  return (
    <div className="goal-list">
      <div className="goal-header">
        <h2>{t('goals')}</h2>
        <span className="year">{currentYear}</span>
      </div>

      {error && <div className="error">{error}</div>}

      <Togglable buttonLabel={t('addNewGoal')}>
        {(onCancel) => (
          <GoalForm 
            year={currentYear}
            onGoalCreated={handleGoalCreated}
            onCancel={onCancel}
            existingGoals={goals}
          />
        )}
      </Togglable>

      {loading ? (
        <p>{t('loading')}</p>
      ) : goals.length === 0 ? (
        <p className="no-goals">{t('noGoalsFor')} {currentYear}</p>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              stats={loadingProgress ? null : getGoalStats(goal.id)}
              onUpdate={handleGoalUpdated}
              onDelete={handleGoalDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GoalList
