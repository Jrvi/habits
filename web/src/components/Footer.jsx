import { t } from '../i18n/translations.js'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>
          {t('madeWith')} {t('by')} Juho Järvi
        </p>
        <p className="footer-version">
          © {currentYear} {t('appName')}
        </p>
      </div>
    </footer>
  )
}

export default Footer
