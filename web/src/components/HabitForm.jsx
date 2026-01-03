import { useState, useEffect } from 'react'
import habitsService from '../services/habits.js'
import goalsService from '../services/goals.js'

const HabitForm = ({ user, habits, setHabits, setNotification, onCancel }) => {
  const [name, setName] = useState('')
  const [impact, setImpact] = useState('')
  const [goalId, setGoalId] = useState('')
  const [goals, setGoals] = useState([])

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const newHabit = { 
      name, 
      impact,
      goal_id: goalId ? parseInt(goalId) : null
    }

    try {
      const createdHabit = await habitsService.create(newHabit)
      setNotification({ message: 'Habit created', type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)

      console.log('Created habit:', createdHabit)
      setHabits(habits.concat(createdHabit))
      setName('')
      setImpact('')
      setGoalId('')
    } catch (error) {
      setNotification({ message: 'Error creating habit', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
      console.error('Error creating habit:', error)
    }
  }

  const CATEGORY_LABELS = {
    career: 'Ura',
    financial: 'Raha',
    health: 'Terveys',
    learning: 'Oppiminen'
  }

  return (
    <div className="habit-form">
      <h2>Habit Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Impact:
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              required
            >
              <option value="">-- select impact --</option>
              <option value="positive">positive</option>
              <option value="neutral">neutral</option>
              <option value="negative">negative</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Tavoite (valinnainen):
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
            >
              <option value="">-- ei tavoitetta --</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {CATEGORY_LABELS[goal.category]} - {goal.description.substring(0, 50)}
                  {goal.description.length > 50 ? '...' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-buttons">
          <button type="submit">Add Habit</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default HabitForm
