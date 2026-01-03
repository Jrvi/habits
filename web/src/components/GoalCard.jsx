import { useState } from 'react'
import goalsService from '../services/goals'
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

const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

const IconUndo = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path d="M12 5V2L7 7l5 5V9c3.31 0 6 2.69 6 6 0 1.3-.42 2.5-1.13 3.47l1.46 1.46A7.96 7.96 0 0 0 20 15c0-4.42-3.58-8-8-8z" />
  </svg>
)

const GoalCard = ({ goal, stats, onUpdate, onDelete }) => {
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
      setError(`${t('errorUpdatingGoal')}: ${err.message}`)
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
      setError(`${t('errorUpdatingGoal')}: ${err.message}`)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(t('confirmDeleteGoal'))) {
      try {
        await goalsService.remove(goal.id)
        onDelete(goal.id)
      } catch (err) {
        setError(`${t('errorDeletingGoal')}: ${err.message}`)
      }
    }
  }

  const categoryLabel = t(goal.category)

  return (
    <div className={`goal-card ${goal.completed ? 'completed' : goal.completed === false ? 'not-completed' : ''}`}>
      <div className="goal-header">
        <h4>{categoryLabel || goal.category}</h4>
        <div className="goal-actions">
          {!isEditing && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title={t('edit')}
                aria-label={t('edit')}
              >
                <IconEdit className="goal-action-icon" />
              </button>

              <button
                type="button"
                onClick={handleComplete}
                title={goal.completed ? t('markIncomplete') : t('markComplete')}
                aria-label={goal.completed ? t('markIncomplete') : t('markComplete')}
              >
                {goal.completed ? (
                  <IconUndo className="goal-action-icon" />
                ) : (
                  <IconCheck className="goal-action-icon" />
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                title={t('delete')}
                aria-label={t('delete')}
              >
                <IconTrash className="goal-action-icon" />
              </button>
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
            <button onClick={handleUpdate}>{t('save')}</button>
            <button onClick={() => {
              setDescription(goal.description)
              setIsEditing(false)
            }}>{t('cancel')}</button>
          </div>
        </div>
      ) : (
        <p className="goal-description">{goal.description}</p>
      )}
      
      {goal.completed !== null && (
        <div className="goal-status">
          {t('status')}: {goal.completed ? t('succeeded') : t('failed')}
        </div>
      )}

      {stats && (
        <div className="goal-progress">
          {stats.habitCount === 0 ? (
            <div className="goal-progress-meta">{t('noRelatedHabits')}</div>
          ) : (
            <>
              <div className="goal-progress-meta">
                {t('habitsLinked')}: {stats.habitCount} · {t('yearProgress')}: {stats.percent}%
              </div>
              <div className="goal-progress-bar" aria-hidden="true">
                <div className="goal-progress-bar-fill" style={{ width: `${stats.percent}%` }} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GoalCard
