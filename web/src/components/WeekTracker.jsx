import { useState, useEffect } from 'react'
import completionsService from '../services/completions'
import { t } from '../i18n/translations.js'

const WeekTracker = ({ habitId, habitImpact }) => {
  const [completions, setCompletions] = useState([])
  const [weekDays, setWeekDays] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateWeekDays()
    fetchCompletions()
  }, [habitId])

  const generateWeekDays = () => {
    const days = []
    const today = new Date()
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      // Monday-first index: 0=Mon ... 6=Sun
      const jsDay = date.getDay() // 0=Sun
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1

      days.push({
        date: date,
        dateStr: formatDate(date),
        dayIndex,
        isToday: i === 0,
      })
    }
    setWeekDays(days)
  }

  const fetchCompletions = async () => {
    if (!habitId) return
    
    setLoading(true)
    try {
      const start = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      const end = formatDate(new Date())
      
      const data = await completionsService.getHabitCompletions(habitId, start, end)
      setCompletions(data)
    } catch (err) {
      console.error('Error fetching completions:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDayLabel = (dayIndex) => {
    const keys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    return t(keys[dayIndex] || 'monday')
  }

  const isCompleted = (dateStr) => {
    return completions.some(c => {
      const completionDate = new Date(c.completed_date).toISOString().split('T')[0]
      return completionDate === dateStr
    })
  }

  const handleDayClick = async (day) => {
    if (loading) return
    
    setLoading(true)
    try {
      const completed = isCompleted(day.dateStr)
      
      if (completed) {
        await completionsService.unmarkComplete(habitId, day.dateStr)
        window.dispatchEvent(new CustomEvent('habitisti:completionchange', {
          detail: { habitId, date: day.dateStr, completed: false }
        }))
      } else {
        const completion = await completionsService.markComplete(habitId, day.dateStr)
        window.dispatchEvent(new CustomEvent('habitisti:completionchange', {
          detail: { habitId, date: day.dateStr, completed: true, completion }
        }))
      }
      
      await fetchCompletions()
    } catch (err) {
      console.error('Error toggling completion:', err)
      alert(t('errorSavingCompletion'))
    } finally {
      setLoading(false)
    }
  }

  const getCompletionRate = () => {
    const completedDays = weekDays.filter(day => isCompleted(day.dateStr)).length
    return Math.round((completedDays / weekDays.length) * 100)
  }

  const getStreakInfo = () => {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Check from today backwards
    for (let i = weekDays.length - 1; i >= 0; i--) {
      if (isCompleted(weekDays[i].dateStr)) {
        tempStreak++
        if (i === weekDays.length - 1 || currentStreak > 0) {
          currentStreak++
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return { currentStreak, longestStreak }
  }

  const { currentStreak, longestStreak } = getStreakInfo()

  return (
    <div className="week-tracker">
      <div className="tracker-stats">
        <div className="stat">
          <span className="stat-label">{t('week')}:</span>
          <span className="stat-value">{getCompletionRate()}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('streak')}:</span>
          <span className="stat-value">{currentStreak} {t('days')}</span>
        </div>
      </div>

      <div className="week-days">
        {weekDays.map((day) => {
          const completed = isCompleted(day.dateStr)
          return (
            <button
              key={day.dateStr}
              className={`day-button ${completed ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
              disabled={loading}
              title={`${getDayLabel(day.dayIndex)} ${day.date.getDate()}.${day.date.getMonth() + 1}`}
            >
              <div className="day-name">{getDayLabel(day.dayIndex)}</div>
              <div className="day-number">{day.date.getDate()}</div>
              {completed && <div className="check-mark">✓</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WeekTracker
