import { useState } from "react";

const HabitEditForm = ({ id, name, impact, onSave, onCancel }) => {
  const [newName, setNewName] = useState(name);
  const [newImpact, setNewImpact] = useState(impact);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: newName, impact: newImpact });
  };

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
