import Togglable from "./Togglable";
import HabitEditForm from "./HabitEditForm";

const Habit = ({ id, name, impact, handleDelete, handleEdit }) => {
  const handleDeleteClick = () => {
    if (handleDelete) {
      handleDelete(id);
    }
  };

  return (
    <div className={`habit-card impact-${impact}`}>
      <div className="habit-header">
        <div className="habit-info">
          <h2>{name}</h2>
          <span className={`habit-tag ${impact}`}>{impact}</span>
        </div>

        <div className="habit-buttons">
          <Togglable buttonLabel="Edit">
            {(onCancel) => (
              <HabitEditForm
                id={id}
                name={name}
                impact={impact}
                handleEdit={handleEdit}
                onCancel={onCancel}
              />
            )}
          </Togglable>
          <button className="delete-btn" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Habit;
