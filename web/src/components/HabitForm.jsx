import { useState, useEffect } from 'react'
import habitsService from '../services/habits.js'
import goalsService from '../services/goals.js'
import { t } from '../i18n/translations.js'

const HabitForm = ({ user, habits, setHabits, setNotification, onCancel }) => {
  const [name, setName] = useState('')
  const [impact, setImpact] = useState('')
  const [goalId, setGoalId] = useState('')
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const data = await goalsService.getByYear(currentYear)
        setGoals(data || [])
      } catch (error) {
        console.error('Error fetching goals:', error)
      }
    }
    fetchGoals()
  }, [])

  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) {
      newErrors.name = t('nameRequired')
    } else if (name.length < 3) {
      newErrors.name = t('nameTooShort')
    } else if (name.length > 100) {
      newErrors.name = t('nameTooLong')
    }
    
    if (!impact) {
      newErrors.impact = t('impactRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    const newHabit = { 
      name: name.trim(), 
      impact,
      goal_id: goalId ? parseInt(goalId) : null
    }

    try {
      const createdHabit = await habitsService.create(newHabit)
      setNotification({ message: t('habitCreated'), type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)

      console.log('Created habit:', createdHabit)
      setHabits(habits.concat(createdHabit))
      setName('')
      setImpact('')
      setGoalId('')
      setErrors({})
      onCancel()
    } catch (error) {
      setNotification({ message: t('errorCreatingHabit'), type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
      console.error('Error creating habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const CATEGORY_LABELS = {
    career: t('career'),
    financial: t('financial'),
    health: t('health'),
    learning: t('learning')
  }

  return (
    <div className="habit-form">
      <h2>{t('createNewHabit')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="habit-name">
            {t('habitName')}
          </label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors({ ...errors, name: null })
            }}
            className={errors.name ? 'input-error' : ''}
            placeholder={t('habitNamePlaceholder')}
            maxLength="100"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
          <span className="char-count">{name.length}/100</span>
        </div>
        <div className="form-field">
          <label htmlFor="habit-impact">
            {t('impact')}
          </label>
          <select
            id="habit-impact"
            value={impact}
            onChange={(e) => {
              setImpact(e.target.value)
              if (errors.impact) setErrors({ ...errors, impact: null })
            }}
            className={errors.impact ? 'input-error' : ''}
          >
            <option value="">{t('selectImpact')}</option>
            <option value="positive">{t('positive')}</option>
            <option value="neutral">{t('neutral')}</option>
            <option value="negative">{t('negative')}</option>
          </select>
          {errors.impact && <span className="error-message">{errors.impact}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="habit-goal">
            {t('goal')} ({t('optional')})
          </label>
          <select
            id="habit-goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            <option value="">{t('noGoal')}</option>
            {goals.map(goal => (
              <option key={goal.id} value={goal.id}>
                {CATEGORY_LABELS[goal.category]} - {goal.description.substring(0, 50)}
                {goal.description.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('creating') : t('addHabit')}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HabitForm
