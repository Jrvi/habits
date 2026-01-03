import { useState, useEffect } from "react";
import HabitEditForm from "./HabitEditForm";
import goalsService from '../services/goals.js'

const Habit = ({ id, name, impact, goalId, handleDelete, handleEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(null);

  useEffect(() => {
    if (goalId) {
      goalsService.getById(goalId)
        .then(data => setGoal(data))
        .catch(err => console.error('Error fetching goal:', err))
    }
  }, [goalId])

  const handleDeleteClick = () => {
    handleDelete?.(id);
  };

  const CATEGORY_LABELS = {
    career: 'Ura',
    financial: 'Raha',
    health: 'Terveys',
    learning: 'Oppiminen'
  }

  return (
    <div className={`habit-card impact-${impact}`}>
      <div className="habit-header">
        <div className="habit-info">
          <h2>{name}</h2>
          <span className={`habit-tag ${impact}`}>{impact}</span>
          {goal && (
            <span className="habit-goal-tag">
              🎯 {CATEGORY_LABELS[goal.category] || goal.category}
            </span>
          )}
        </div>

        <div className="habit-buttons">
          {!isEditing && (
            <>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="delete-btn" onClick={handleDeleteClick}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <HabitEditForm
          id={id}
          name={name}
          impact={impact}
          goalId={goalId}
          onSave={(updatedHabit) => {
            handleEdit(id, updatedHabit);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default Habit;
