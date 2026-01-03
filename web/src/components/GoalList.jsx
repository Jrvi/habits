import { useState, useEffect } from 'react'
import goalsService from '../services/goals'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import Togglable from './Togglable'

const GoalList = () => {
  const [goals, setGoals] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchGoals()
  }, [year])

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await goalsService.getByYear(year)
      // Varmistetaan että data on aina array
      if (Array.isArray(data)) {
        setGoals(data)
      } else {
        setGoals([])
      }
    } catch (err) {
      setError('Virhe tavoitteiden haussa: ' + err.message)
      console.error('Error fetching goals:', err)
      setGoals([])
    } finally {
      setLoading(false)
    }
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

  const changeYear = (delta) => {
    setYear(year + delta)
  }

  return (
    <div className="goal-list">
      <div className="goal-header">
        <h2>Tavoitteet</h2>
        <div className="year-selector">
          <button onClick={() => changeYear(-1)}>←</button>
          <span className="year">{year}</span>
          <button onClick={() => changeYear(1)}>→</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <Togglable buttonLabel="Lisää uusi tavoite">
        <GoalForm 
          year={year} 
          onGoalCreated={handleGoalCreated}
        />
      </Togglable>

      {loading ? (
        <p>Ladataan...</p>
      ) : goals.length === 0 ? (
        <p className="no-goals">Ei tavoitteita vuodelle {year}</p>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
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
