import { useState } from 'react'
import goalsService from '../services/goals'
import { t } from '../i18n/translations.js'

const CATEGORIES = [
  { value: 'career', labelKey: 'career' },
  { value: 'financial', labelKey: 'financial' },
  { value: 'health', labelKey: 'health' },
  { value: 'learning', labelKey: 'learning' }
]

const GoalForm = ({ year, onGoalCreated, onCancel, existingGoals = [] }) => {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Get categories that already have goals
  const usedCategories = existingGoals.map(goal => goal.category)
  const availableCategories = CATEGORIES.filter(cat => !usedCategories.includes(cat.value))

  const validateForm = () => {
    const newErrors = {}
    
    if (!category) {
      newErrors.category = t('categoryRequired')
    }
    
    if (!description.trim()) {
      newErrors.description = t('descriptionRequired')
    } else if (description.length < 10) {
      newErrors.description = t('descriptionTooShort')
    } else if (description.length > 500) {
      newErrors.description = t('descriptionTooLong')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const newGoal = {
        year: parseInt(year),
        category,
        description: description.trim()
      }
      const createdGoal = await goalsService.create(newGoal)
      setCategory('')
      setDescription('')
      setErrors({})
      onGoalCreated(createdGoal)
      onCancel()
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || t('errorCreatingGoal')
      setErrors({ submit: errorMessage })
      console.error('Error creating goal:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="goal-form">
      {availableCategories.length === 0 ? (
        <>
          <p className="no-categories">{t('allCategoriesUsed')}</p>
          {onCancel && (
            <div className="form-buttons">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                {t('cancel')}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="goal-category">{t('category')}</label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (errors.category) setErrors({ ...errors, category: null })
                }}
                className={errors.category ? 'input-error' : ''}
              >
                <option value="">{t('selectCategory')}</option>
                {availableCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {t(cat.labelKey)}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="goal-description">{t('description')}</label>
              <textarea
                id="goal-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors({ ...errors, description: null })
                }}
                className={errors.description ? 'input-error' : ''}
                maxLength={500}
                rows={4}
                placeholder={t('describeGoal')}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              <span className="char-count">{description.length}/500</span>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </button>
              {onCancel && (
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default GoalForm
