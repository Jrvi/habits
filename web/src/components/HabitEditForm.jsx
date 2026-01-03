import { useState, useEffect } from "react";
import goalsService from '../services/goals.js'

const HabitEditForm = ({ id, name, impact, goalId, onSave, onCancel }) => {
  const [newName, setNewName] = useState(name);
  const [newImpact, setNewImpact] = useState(impact);
  const [newGoalId, setNewGoalId] = useState(goalId || '');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      name: newName, 
      impact: newImpact,
      goal_id: newGoalId ? parseInt(newGoalId) : null
    });
  };

  const CATEGORY_LABELS = {
    career: 'Ura',
    financial: 'Raha',
    health: 'Terveys',
    learning: 'Oppiminen'
  }

  return (
    <form className="habit-edit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <select
        value={newImpact}
        onChange={(e) => setNewImpact(e.target.value)}
      >
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>

      <select
        value={newGoalId}
        onChange={(e) => setNewGoalId(e.target.value)}
      >
        <option value="">-- ei tavoitetta --</option>
        {goals.map(goal => (
          <option key={goal.id} value={goal.id}>
            {CATEGORY_LABELS[goal.category]} - {goal.description.substring(0, 50)}
            {goal.description.length > 50 ? '...' : ''}
          </option>
        ))}
      </select>

      <div className="form-buttons">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default HabitEditForm;
