import { useState } from "react";
import HabitEditForm from "./HabitEditForm";

const Habit = ({ id, name, impact, handleDelete, handleEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteClick = () => {
    handleDelete?.(id);
  };

  return (
    <div className={`habit-card impact-${impact}`}>
      <div className="habit-header">
        <div className="habit-info">
          <h2>{name}</h2>
          <span className={`habit-tag ${impact}`}>{impact}</span>
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
