import { useEffect, useState } from "react"
import feedService from "../services/feed.js"
import habitsService from "../services/habits.js"
import Habit from "./Habit.jsx"
import Togglable from "./Togglable.jsx"
import HabitForm from "./HabitForm.jsx"
import { t } from '../i18n/translations.js'

export default function HabitList({ habits, setHabits, user, setNotification }) {

  const handleEdit = async (id, updatedHabit) => {
    try {
      const updated = await habitsService.update(id, updatedHabit)
      setHabits(habits.map(habit => habit.id === id ? updated : habit))
      setNotification({ message: t('habitUpdated'), type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (error) {
      console.error('Error updating habit:', error)
      setNotification({ message: t('errorUpdatingHabit'), type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleDelete = async (id) => {
    try {
      await habitsService.remove(id)
      setHabits(habits.filter(habit => habit.id !== id))
      setNotification({ message: t('habitDeleted'), type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (error) {
      console.error('Error deleting habit:', error)
      setNotification({ message: t('errorDeletingHabit'), type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  return (
    <div>
      {habits.map(habit => (
        <Habit 
          key={habit.id} 
          id={habit.id} 
          name={habit.name} 
          impact={habit.impact}
          goalId={habit.goal_id}
          handleDelete={handleDelete} 
          handleEdit={handleEdit} 
        />
      ))}
      <Togglable buttonLabel={t('newHabit')}>
        {(onCancel) => (
          <HabitForm
            user={user}
            habits={habits}
            setHabits={setHabits}
            setNotification={setNotification}
            onCancel={onCancel}
          />
        )}
      </Togglable>
    </div>
  )
}

