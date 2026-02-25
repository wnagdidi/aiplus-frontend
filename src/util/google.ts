export const promptOnTagLogin = () => {
  try {
    window.google.accounts.id.prompt()
  } catch (e) {
    console.error('error prompt google one tap login')
  }
}
