import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Notification from "./Notification.jsx"
import activateService from "../services/activate.js"
import { t } from '../i18n/translations.js'

const ActivationPage = () => {
  const { token } = useParams()
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setNotification({ message: t('activationInvalidLink'), type: "error" })
      return
    }

    const activate = async () => {
      try {
        await activateService.activate(token)
        setNotification({ message: t('activationSuccess'), type: "success" })
        setTimeout(() => navigate("/login"), 3000)
      } catch (err) {
        setNotification({
          message: t('activationFailed'),
          type: "error",
        })
      }
    }

    activate()
  }, [token, navigate])

  return (
    <div className="auth-form">
      <h2>{t('activationTitle')}</h2>
      <Notification notification={notification} />
      {notification?.type === "success" ? (
        <p>{t('activationRedirectSuccess')}</p>
      ) : (
        <p>{t('activationTryAgain')}</p>
      )}
    </div>
  )
}

export default ActivationPage
