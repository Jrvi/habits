import { useState, useEffect } from 'react'
import completionsService from '../services/completions'

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
      days.push({
        date: date,
        dateStr: formatDate(date),
        dayName: getDayName(date),
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

  const getDayName = (date) => {
    const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
    return days[date.getDay() === 0 ? 6 : date.getDay() - 1]
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
      } else {
        await completionsService.markComplete(habitId, day.dateStr)
      }
      
      await fetchCompletions()
    } catch (err) {
      console.error('Error toggling completion:', err)
      alert('Virhe merkinnän tallentamisessa')
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
          <span className="stat-label">Viikko:</span>
          <span className="stat-value">{getCompletionRate()}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Putki:</span>
          <span className="stat-value">{currentStreak} pv</span>
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
              title={`${day.dayName} ${day.date.getDate()}.${day.date.getMonth() + 1}`}
            >
              <div className="day-name">{day.dayName}</div>
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
