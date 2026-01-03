import { useState } from 'react'
import goalsService from '../services/goals'

const CATEGORIES = [
  { value: 'career', label: 'Ura' },
  { value: 'financial', label: 'Raha' },
  { value: 'health', label: 'Terveys' },
  { value: 'learning', label: 'Oppiminen' }
]

const GoalForm = ({ year, onGoalCreated, onCancel }) => {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    try {
      const newGoal = {
        year: parseInt(year),
        category,
        description
      }
      const createdGoal = await goalsService.create(newGoal)
      setCategory('')
      setDescription('')
      onGoalCreated(createdGoal)
    } catch (err) {
      setError('Virhe tavoitteen luonnissa: ' + err.message)
      console.error('Error creating goal:', err)
    }
  }

  return (
    <div className="goal-form">
      <h3>Lisää uusi tavoite vuodelle {year}</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Kategoria:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Valitse kategoria</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Kuvaus:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
              rows={4}
              placeholder="Kirjoita tavoitteesi..."
            />
          </label>
        </div>
        <div className="button-group">
          <button type="submit">Tallenna</button>
          {onCancel && <button type="button" onClick={onCancel}>Peruuta</button>}
        </div>
      </form>
    </div>
  )
}

export default GoalForm
