export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  avatar: string
  creditsBalance: number
}

export interface User extends UserProfile {
  name: string
  accessToken: string
}
