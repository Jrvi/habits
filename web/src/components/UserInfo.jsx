import { LogOut } from "lucide-react"

const UserInfo = ({ user, handleLogout }) => {
  return (
    <div className="user-info-card">
      <div className="user-greeting">
        <h2>
          Hi <span className="username">{user.username}</span>!
        </h2>
        <p>Welcome back to Habitisti</p>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  )
}

export default UserInfo;
