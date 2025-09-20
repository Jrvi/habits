const HabitEditForm = ({ id, name, impact, handleEdit, onCancel }) => {

    const handleSubmit = (event) => {
        event.preventDefault()
        const updatedHabit = {
            name: event.target.name.value,
            impact: event.target.impact.value
        };
        handleEdit(id, updatedHabit)

        if (onCancel) {
            onCancel()
        }
    }

    return (
    <div className="habit-edit-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              defaultValue={name}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Impact:
            <select
              name="impact"
              defaultValue={impact}
              required
            >
              <option value="positive">positive</option>
              <option value="neutral">neutral</option>
              <option value="negative">negative</option>
            </select>
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default HabitEditForm