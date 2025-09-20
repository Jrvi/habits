import { useState } from 'react'
import habitsService from '../services/habits.js'

const HabitForm = ({ user, habits, setHabits, setNotification, onCancel }) => {
  const [name, setName] = useState('')
  const [impact, setImpact] = useState('')
  const handleSubmit = async (event) => {
    event.preventDefault()
    const newHabit = { name, impact }

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
    } catch (error) {
      setNotification({ message: 'Error creating habit', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
      console.error('Error creating habit:', error)
    }
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
        <div className="form-buttons">
          <button type="submit">Add Habit</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default HabitForm
