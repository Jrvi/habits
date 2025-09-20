import { useEffect, useState } from "react"
import feedService from "../services/feed.js"
import habitsService from "../services/habits.js"
import Habit from "./Habit.jsx"

const HabitList = ({ habits, setHabits, setNotification }) => {

  const handleEdit = async (id, updatedHabit) => {
    try {
      const updated = await habitsService.update(id, updatedHabit)
      setHabits(habits.map(habit => habit.id === id ? updated : habit))
      setNotification({ message: 'Habit updated', type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (error) {
      console.error('Error updating habit:', error)
      setNotification({ message: 'Error updating habit', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleDelete = async (id) => {
    try {
      await habitsService.remove(id)
      setHabits(habits.filter(habit => habit.id !== id))
      setNotification({ message: 'Habit deleted', type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (error) {
      console.error('Error deleting habit:', error)
      setNotification({ message: 'Error deleting habit', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  return (
    <div>
      {habits.map(habit => (
        <Habit key={habit.id} id={habit.id} name={habit.name} impact={habit.impact} handleDelete={handleDelete} handleEdit={handleEdit} />
      ))}
    </div>
  )
}

export default HabitList
