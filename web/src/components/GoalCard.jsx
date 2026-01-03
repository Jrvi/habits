import { useState } from 'react'
import goalsService from '../services/goals'

const CATEGORY_LABELS = {
  career: 'Ura',
  financial: 'Raha',
  health: 'Terveys',
  learning: 'Oppiminen'
}

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(goal.description)
  const [error, setError] = useState(null)

  const handleUpdate = async () => {
    setError(null)
    try {
      const updated = await goalsService.update(goal.id, {
        description,
        completed: goal.completed
      })
      onUpdate(updated)
      setIsEditing(false)
    } catch (err) {
      setError('Virhe päivityksessä: ' + err.message)
    }
  }

  const handleComplete = async () => {
    setError(null)
    try {
      const updated = await goalsService.update(goal.id, {
        description: goal.description,
        completed: goal.completed === null ? true : !goal.completed
      })
      onUpdate(updated)
    } catch (err) {
      setError('Virhe tilassa: ' + err.message)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Haluatko varmasti poistaa tämän tavoitteen?')) {
      try {
        await goalsService.remove(goal.id)
        onDelete(goal.id)
      } catch (err) {
        setError('Virhe poistossa: ' + err.message)
      }
    }
  }

  return (
    <div className={`goal-card ${goal.completed ? 'completed' : goal.completed === false ? 'not-completed' : ''}`}>
      <div className="goal-header">
        <h4>{CATEGORY_LABELS[goal.category] || goal.category}</h4>
        <div className="goal-actions">
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} title="Muokkaa">✏️</button>
              <button onClick={handleComplete} title={goal.completed ? "Merkitse kesken" : "Merkitse onnistuneeksi"}>
                {goal.completed === null ? '⭕' : goal.completed ? '✅' : '❌'}
              </button>
              <button onClick={handleDelete} title="Poista">🗑️</button>
            </>
          )}
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {isEditing ? (
        <div className="goal-edit">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <div className="button-group">
            <button onClick={handleUpdate}>Tallenna</button>
            <button onClick={() => {
              setDescription(goal.description)
              setIsEditing(false)
            }}>Peruuta</button>
          </div>
        </div>
      ) : (
        <p className="goal-description">{goal.description}</p>
      )}
      
      {goal.completed !== null && (
        <div className="goal-status">
          Tila: {goal.completed ? '✅ Onnistui' : '❌ Ei onnistunut'}
        </div>
      )}
    </div>
  )
}

export default GoalCard
