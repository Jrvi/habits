import { useState, useEffect } from "react";
import HabitEditForm from "./HabitEditForm";
import WeekTracker from "./WeekTracker";
import goalsService from '../services/goals.js'
import { t } from '../i18n/translations.js'

const IconEdit = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
  </svg>
)

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
  </svg>
)

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

  const goalCategoryLabel = goal?.category ? t(goal.category) : null
  const impactLabel = t(impact)

  return (
    <div className={`habit-card impact-${impact}`}>
      <div className="habit-header">
        <div className="habit-info">
          <h2>{name}</h2>
          <span className={`habit-tag ${impact}`}>{impactLabel}</span>
          {goal && (
            <span className="habit-goal-tag">
              {goalCategoryLabel || goal.category}
            </span>
          )}
        </div>

        <div className="habit-buttons">
          {!isEditing && (
            <>
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                title={t('edit')}
                aria-label={t('edit')}
              >
                <IconEdit className="habit-action-icon" />
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={handleDeleteClick}
                title={t('delete')}
                aria-label={t('delete')}
              >
                <IconTrash className="habit-action-icon" />
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

      {!isEditing && (
        <WeekTracker habitId={id} habitImpact={impact} />
      )}
    </div>
  );
};

export default Habit;
