const STORAGE_KEY = 'habitisti:lang'
const EVENT_NAME = 'habitisti:languagechange'

const translations = {
  en: {
    // Auth
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    confirmPassword: 'Confirm password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    registerHere: 'Register here',
    loginHere: 'Login here',
    createAccount: 'Create account',
    passwordsDoNotMatch: 'Passwords do not match',

    // Activation
    activationTitle: 'Account activation',
    activationInvalidLink: 'Invalid activation link',
    activationSuccess: 'Account activated! You can now log in.',
    activationFailed: 'Activation failed. The link may be invalid or expired.',
    activationRedirectSuccess: 'You will be redirected to login shortly...',
    activationTryAgain: 'Please try again or request a new activation link.',

    // Welcome
    appName: 'Habitisti',
    welcomeBack: 'Welcome back to Habitisti',
    welcomeMessage: 'Track your daily habits and achieve your yearly goals',
    joinTitle: 'Join Habitisti',
    joinMessage: 'Start tracking your habits and reach your goals',
    hi: 'Hi',

    // Goals
    goals: 'Goals',
    newGoal: 'New goal',
    addNewGoal: 'Add new goal',
    noGoalsFor: 'No goals for',
    allCategoriesUsed: 'You already have goals for all categories this year!',
    category: 'Category',
    description: 'Description',
    selectCategory: 'Select category',
    describeGoal: 'Describe your goal for the year…',

    // Categories
    career: 'Career',
    financial: 'Financial',
    health: 'Health',
    learning: 'Learning',

    // Habits
    habits: 'Habits',
    newHabit: 'New habit',
    createNewHabit: 'Create new habit',
    habitName: 'Name',
    habitNamePlaceholder: 'e.g. Morning run',
    impact: 'Impact',
    goal: 'Goal',
    optional: 'optional',
    noGoal: 'No goal',
    selectImpact: 'Select impact',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',

    // Actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    addHabit: 'Add habit',
    saving: 'Saving…',
    creating: 'Creating…',
    loading: 'Loading…',
    sending: 'Sending…',

    // Profile
    profile: 'Profile',
    back: 'Back',
    updateEmail: 'Change email',
    newEmail: 'New email',
    currentPassword: 'Current password',
    emailUpdated: 'Email updated',
    errorUpdatingEmail: 'Error updating email',
    updatePassword: 'Change password',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    passwordUpdated: 'Password updated',
    errorUpdatingPassword: 'Error updating password',

    // Password reset
    forgotPassword: 'Forgot password?',
    forgotPasswordHelp: 'Enter your email and we will send a reset link.',
    sendResetLink: 'Send reset link',
    resetLinkSent: 'If an account exists, a reset link has been sent.',
    backToLogin: 'Back to login',
    resetPassword: 'Reset password',
    resetPasswordHelp: 'Choose a new password for your account.',
    passwordResetSuccess: 'Password reset successful. You can now log in.',
    passwordResetFailed: 'Password reset failed. The link may be invalid or expired.',

    // Week tracker
    week: 'Week',
    streak: 'Streak',
    days: 'days',

    // Days (Mon-first abbreviations)
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',

    // Messages
    loginSuccessful: 'Login successful',
    wrongCredentials: 'Wrong username or password',
    accountCreated: 'Account created! Please check your email to activate.',
    registrationFailed: 'Registration failed',
    habitCreated: 'Habit created successfully!',
    habitUpdated: 'Habit updated',
    habitDeleted: 'Habit deleted',
    goalCreated: 'Goal created successfully!',
    goalUpdated: 'Goal updated',
    goalDeleted: 'Goal deleted',

    // Errors
    errorCreatingHabit: 'Error creating habit. Please try again.',
    errorUpdatingHabit: 'Error updating habit',
    errorDeletingHabit: 'Error deleting habit',
    errorCreatingGoal: 'Error creating goal',
    errorUpdatingGoal: 'Error updating goal',
    errorDeletingGoal: 'Error deleting goal',
    errorFetchingGoals: 'Error fetching goals',
    errorSavingCompletion: 'Error saving completion',
    nameRequired: 'Name is required',
    nameTooShort: 'Name must be at least 3 characters',
    nameTooLong: 'Name must be less than 100 characters',
    impactRequired: 'Impact is required',
    categoryRequired: 'Category is required',
    descriptionRequired: 'Description is required',
    descriptionTooShort: 'Description must be at least 10 characters',
    descriptionTooLong: 'Description must be less than 500 characters',

    // Goal card
    confirmDeleteGoal: 'Do you really want to delete this goal?',
    markIncomplete: 'Mark as in progress',
    markComplete: 'Mark as completed',
    status: 'Status',
    succeeded: 'Succeeded',
    failed: 'Failed',
    habitsLinked: 'Habits linked',
    yearProgress: 'Year progress',
    noRelatedHabits: 'No related habits',

    // Footer
    madeWith: 'Made with',
    by: 'by',
    version: 'Version',
  },
  fi: {
    // Auth
    login: 'Kirjaudu',
    logout: 'Kirjaudu ulos',
    register: 'Rekisteröidy',
    email: 'Sähköposti',
    password: 'Salasana',
    username: 'Käyttäjänimi',
    confirmPassword: 'Vahvista salasana',
    dontHaveAccount: 'Eikö sinulla ole tiliä?',
    alreadyHaveAccount: 'Onko sinulla jo tili?',
    registerHere: 'Rekisteröidy tästä',
    loginHere: 'Kirjaudu tästä',
    createAccount: 'Luo tili',
    passwordsDoNotMatch: 'Salasanat eivät täsmää',

    // Activation
    activationTitle: 'Tilin aktivointi',
    activationInvalidLink: 'Virheellinen aktivointilinkki',
    activationSuccess: 'Tili aktivoitu! Voit nyt kirjautua sisään.',
    activationFailed: 'Aktivointi epäonnistui. Linkki voi olla virheellinen tai vanhentunut.',
    activationRedirectSuccess: 'Ohjataan kirjautumissivulle hetken kuluttua...',
    activationTryAgain: 'Yritä uudelleen tai pyydä uusi aktivointilinkki.',

    // Welcome
    appName: 'Habitisti',
    welcomeBack: 'Tervetuloa takaisin Habitistiin',
    welcomeMessage: 'Seuraa päivittäisiä tapojasi ja saavuta vuositavoitteesi',
    joinTitle: 'Liity Habitistiin',
    joinMessage: 'Aloita tapojen seuranta ja saavuta tavoitteesi',
    hi: 'Hei',

    // Goals
    goals: 'Tavoitteet',
    newGoal: 'Uusi tavoite',
    addNewGoal: 'Lisää uusi tavoite',
    noGoalsFor: 'Ei tavoitteita vuodelle',
    allCategoriesUsed: 'Sinulla on jo tavoitteet kaikille kategorioille tälle vuodelle!',
    category: 'Kategoria',
    description: 'Kuvaus',
    selectCategory: 'Valitse kategoria',
    describeGoal: 'Kuvaile tavoitteesi...',

    // Categories
    career: 'Ura',
    financial: 'Raha',
    health: 'Terveys',
    learning: 'Oppiminen',

    // Habits
    habits: 'Tavat',
    newHabit: 'Uusi tapa',
    createNewHabit: 'Luo uusi tapa',
    habitName: 'Nimi',
    habitNamePlaceholder: 'esim. Aamujuoksu',
    impact: 'Vaikutus',
    goal: 'Tavoite',
    optional: 'valinnainen',
    noGoal: 'Ei tavoitetta',
    selectImpact: 'Valitse vaikutus',
    positive: 'Positiivinen',
    neutral: 'Neutraali',
    negative: 'Negatiivinen',

    // Actions
    save: 'Tallenna',
    cancel: 'Peruuta',
    edit: 'Muokkaa',
    delete: 'Poista',
    addHabit: 'Lisää tapa',
    saving: 'Tallennetaan...',
    creating: 'Luodaan...',
    loading: 'Ladataan...',
    sending: 'Lähetetään...',

    // Profile
    profile: 'Profiili',
    back: 'Takaisin',
    updateEmail: 'Vaihda sähköposti',
    newEmail: 'Uusi sähköposti',
    currentPassword: 'Nykyinen salasana',
    emailUpdated: 'Sähköposti päivitetty',
    errorUpdatingEmail: 'Virhe sähköpostia päivitettäessä',
    updatePassword: 'Vaihda salasana',
    newPassword: 'Uusi salasana',
    confirmNewPassword: 'Vahvista uusi salasana',
    passwordUpdated: 'Salasana päivitetty',
    errorUpdatingPassword: 'Virhe salasanaa päivitettäessä',

    // Password reset
    forgotPassword: 'Unohditko salasanan?',
    forgotPasswordHelp: 'Syötä sähköpostisi ja lähetämme palautuslinkin.',
    sendResetLink: 'Lähetä palautuslinkki',
    resetLinkSent: 'Jos tili löytyy, palautuslinkki on lähetetty.',
    backToLogin: 'Takaisin kirjautumiseen',
    resetPassword: 'Palauta salasana',
    resetPasswordHelp: 'Valitse uusi salasana tilillesi.',
    passwordResetSuccess: 'Salasanan palautus onnistui. Voit nyt kirjautua sisään.',
    passwordResetFailed: 'Salasanan palautus epäonnistui. Linkki voi olla virheellinen tai vanhentunut.',

    // Week tracker
    week: 'Viikko',
    streak: 'Putki',
    days: 'pv',

    // Days (Mon-first abbreviations)
    monday: 'Ma',
    tuesday: 'Ti',
    wednesday: 'Ke',
    thursday: 'To',
    friday: 'Pe',
    saturday: 'La',
    sunday: 'Su',

    // Messages
    loginSuccessful: 'Kirjautuminen onnistui',
    wrongCredentials: 'Väärä käyttäjätunnus tai salasana',
    accountCreated: 'Tili luotu! Tarkista sähköpostisi aktivoidaksesi tilin.',
    registrationFailed: 'Rekisteröityminen epäonnistui',
    habitCreated: 'Tapa luotu onnistuneesti!',
    habitUpdated: 'Tapa päivitetty',
    habitDeleted: 'Tapa poistettu',
    goalCreated: 'Tavoite luotu onnistuneesti!',
    goalUpdated: 'Tavoite päivitetty',
    goalDeleted: 'Tavoite poistettu',

    // Errors
    errorCreatingHabit: 'Virhe tapaa luotaessa. Yritä uudelleen.',
    errorUpdatingHabit: 'Virhe tapaa päivitettäessä',
    errorDeletingHabit: 'Virhe tapaa poistaessa',
    errorCreatingGoal: 'Virhe tavoitetta luotaessa',
    errorUpdatingGoal: 'Virhe tavoitetta päivitettäessä',
    errorDeletingGoal: 'Virhe tavoitetta poistaessa',
    errorFetchingGoals: 'Virhe tavoitteiden haussa',
    errorSavingCompletion: 'Virhe merkinnän tallentamisessa',
    nameRequired: 'Nimi on pakollinen',
    nameTooShort: 'Nimen täytyy olla vähintään 3 merkkiä',
    nameTooLong: 'Nimen täytyy olla alle 100 merkkiä',
    impactRequired: 'Vaikutus on pakollinen',
    categoryRequired: 'Kategoria on pakollinen',
    descriptionRequired: 'Kuvaus on pakollinen',
    descriptionTooShort: 'Kuvauksen täytyy olla vähintään 10 merkkiä',
    descriptionTooLong: 'Kuvauksen täytyy olla alle 500 merkkiä',

    // Goal card
    confirmDeleteGoal: 'Haluatko varmasti poistaa tämän tavoitteen?',
    markIncomplete: 'Merkitse kesken',
    markComplete: 'Merkitse onnistuneeksi',
    status: 'Tila',
    succeeded: 'Onnistui',
    failed: 'Ei onnistunut',
    habitsLinked: 'Liitetyt tavat',
    yearProgress: 'Vuoden edistyminen',
    noRelatedHabits: 'Ei liitettyjä tapoja',

    // Footer
    madeWith: 'Tehty',
    by: 'tekijä',
    version: 'Versio',
  },
}

let currentLang =
  (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) ||
  'fi'

export const getLanguage = () => currentLang

export const setLanguage = (lang) => {
  if (!translations[lang]) return
  currentLang = lang
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lang)
    window.dispatchEvent(new Event(EVENT_NAME))
  }
}

const format = (str, vars) => {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

// [`t`](web/src/i18n/translations.js): käännös + fallback en -> key
export const t = (key, vars) => {
  const dict = translations[currentLang] || translations.en
  const fallback = translations.en || {}
  const value = dict[key] ?? fallback[key] ?? key
  return format(value, vars)
}

// App kuuntelee tätä re-renderiä varten
export const onLanguageChange = (handler) => {
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}
