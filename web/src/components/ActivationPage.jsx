import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Notification from "./Notification.jsx"
import activateService from "../services/activate.js"

const ActivationPage = () => {
  const { token } = useParams()
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setNotification({ message: "Invalid activation link", type: "error" })
      return
    }

    const activate = async () => {
      try {
        await activateService.activate(token)
        setNotification({ message: "Account activated! You can now log in.", type: "success" })
        setTimeout(() => navigate("/login"), 3000)
      } catch (err) {
        setNotification({
          message: "Activation failed. The link may be invalid or expired.",
          type: "error",
        })
      }
    }

    activate()
  }, [token, navigate])

  return (
    <div className="auth-form">
      <h2>Account Activation</h2>
      <Notification notification={notification} />
      {notification?.type === "success" ? (
        <p>You will be redirected to login shortly...</p>
      ) : (
        <p>Please try again or request a new activation link.</p>
      )}
    </div>
  )
}

export default ActivationPage
