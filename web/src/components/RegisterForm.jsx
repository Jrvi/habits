import { useState } from "react";
import Logo from "./Logo";
import { t } from '../i18n/translations.js'

const RegisterForm = ({ handleRegister }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }

    handleRegister({ username, email, password });
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="auth-form">
      <div className="login-header">
        <Logo />
      </div>

      <h2>{t('register')}</h2>

      <form onSubmit={handleRegisterSubmit}>
        <div className="form-group">
          <label htmlFor="username">{t('username')}</label>
          <input
            id="username"
            type="text"
            name="Username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            type="email"
            name="Email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            name="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
          <input
            id="confirmPassword"
            type="password"
            name="ConfirmPassword"
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            required
          />
        </div>

        <button type="submit">{t('createAccount')}</button>
      </form>
    </div>
  );
};

export default RegisterForm;
