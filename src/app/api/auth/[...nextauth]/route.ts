import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {
  login,
  loginByFacebookAccessToken,
  loginByFacebookCode,
  loginByGoogleOauth,
  loginByGoogleOneTap
} from '@/api/server/authApi'
import UserApi from '@/api/server/userApi'
import CoreApiError from '@/api/core/coreApiError'

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'login-username',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const authorization = await login({
            email: credentials.username,
            password: credentials.password,
          })
          const userApi = new UserApi(authorization)
          return await userApi.getLoggedUser()
        } catch (e) {
          console.error(e)
          if (e instanceof CoreApiError) {
            throw new Error(e.code)
          }
          throw e
        }
      },
    }),
    CredentialsProvider({
      id: 'login-google-auth-code',
      credentials: {
        code: { label: 'Code', type: 'text' },
        auth_code: { label: 'Auth Code', type: 'text' },
        state: { label: 'State', type: 'text' },
        authorization_code: { label: 'Authorization Code', type: 'text' },
        oauth_token: { label: 'Oauth token', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const authorization = await loginByGoogleOauth({
            code: credentials.code,
            auth_code: credentials.auth_code,
            state: credentials.state,
            authorization_code: credentials.authorization_code,
            oauth_token: credentials.oauth_token,
          })
          const userApi = new UserApi(authorization.token)
          return await userApi.getLoggedUser(authorization.newUser)
        } catch (e) {
          console.error(e)
          if (e instanceof CoreApiError) {
            throw new Error(e.code)
          }
          throw e
        }
      },
    }),
    CredentialsProvider({
      id: 'login-google-one-tap',
      credentials: {
        credential: { label: 'Credential', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const authorization = await loginByGoogleOneTap({
            credential: credentials.credential,
          })
          const userApi = new UserApi(authorization.token)
          return await userApi.getLoggedUser(authorization.newUser)
        } catch (e) {
          console.error(e)
          if (e instanceof CoreApiError) {
            throw new Error(e.code)
          }
          throw e
        }
      },
    }),
    CredentialsProvider({
      id: 'login-facebook-auth-code',
      credentials: {
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const authorization = await loginByFacebookCode({
            code: credentials.code,
          })
          const userApi = new UserApi(authorization.token)
          return await userApi.getLoggedUser(authorization.newUser)
        } catch (e) {
          console.error(e)
          if (e instanceof CoreApiError) {
            throw new Error(e.code)
          }
          throw e
        }
      },
    }),
    CredentialsProvider({
      id: 'login-facebook-access-token',
      credentials: {
        accessToken: { label: 'AccessToken', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const authorization = await loginByFacebookAccessToken({
            credential: credentials.accessToken,
          })
          const userApi = new UserApi(authorization.token)
          return await userApi.getLoggedUser(authorization.newUser)
        } catch (e) {
          console.error(e)
          if (e instanceof CoreApiError) {
            throw new Error(e.code)
          }
          throw e
        }
      },
    }),
    CredentialsProvider({
      id: 'guest-login',
      credentials: {
        accessToken: { label: 'AccessToken', type: 'text' },
        id: { label: 'ID', type: 'text' },
        email: { label: 'Email', type: 'text' },
        firstName: { label: 'FirstName', type: 'text' },
        lastName: { label: 'LastName', type: 'text' },
        name: { label: 'Name', type: 'text' },
        avatar: { label: 'Avatar', type: 'text' },
        isGuest: { label: 'IsGuest', type: 'text' },
        isNew: { label: 'IsNew', type: 'text' },
        fbc: { label: 'Fbc', type: 'text' },
        utmSource: { label: 'UtmSource', type: 'text' },
        location: { label: 'Location', type: 'text' },
        subscriptionCycle: { label: 'SubscriptionCycle', type: 'text' },
        subscriptionStatus: { label: 'SubscriptionStatus', type: 'text' },
        nextPaymentTime: { label: 'NextPaymentTime', type: 'text' },
        paymentCount: { label: 'PaymentCount', type: 'text' },
        planName: { label: 'PlanName', type: 'text' },
        planTag: { label: 'PlanTag', type: 'text' },
        creditsBalance: { label: 'CreditsBalance', type: 'text' },
        cumulativeConsumption: { label: 'CumulativeConsumption', type: 'text' },
      },
      async authorize(credentials) {
        try {
          // 访客登录：直接使用传入的 token 和用户信息
          if (!credentials?.accessToken) {
            throw new Error('Guest access token is required')
          }
          
          // 从 credentials 中提取用户信息（在客户端调用 signIn 时传递）
          const guestUser = {
            id: credentials.id ? parseInt(credentials.id) : 0,
            email: credentials.email || '',
            firstName: credentials.firstName || '',
            lastName: credentials.lastName || '',
            name: credentials.name || 'Guest',
            avatar: credentials.avatar || '',
            accessToken: credentials.accessToken,
            isGuest: true,
            isNew: credentials.isNew === 'true',
            fbc: credentials.fbc || null,
            utmSource: credentials.utmSource || '',
            location: credentials.location || null,
            subscriptionCycle: credentials.subscriptionCycle || null,
            subscriptionStatus: credentials.subscriptionStatus || null,
            nextPaymentTime: credentials.nextPaymentTime || null,
            paymentCount: credentials.paymentCount ? parseInt(credentials.paymentCount) : 0,
            planName: credentials.planName || null,
            planTag: credentials.planTag || null,
            creditsBalance: credentials.creditsBalance ? parseInt(credentials.creditsBalance) : 0,
            cumulativeConsumption: credentials.cumulativeConsumption ? parseInt(credentials.cumulativeConsumption) : 0,
          }
          
          return guestUser as any
        } catch (e) {
          console.error('Guest login error:', e)
          throw e
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 5 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        Object.assign(token, user)
      }
      if (trigger === 'update' && session) {
        // 如果是访客用户更新，直接合并所有字段
        if (session.isGuest !== undefined) {
          Object.assign(token, session)
        } else {
          // 普通用户信息更新
          if (session.firstName) {
            Object.assign(token, {
              firstName: session.firstName,
              lastName: session.lastName,
              name: `${session.firstName}${session.lastName ? ' ' + session.lastName : ''}`,
            })
          }
          if (session.email) {
            Object.assign(token, { email: session.email })
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      // 只有当 token 中有用户信息时才更新 session（支持访客用户）
      if (token.id !== undefined) {
        session.user.id = token.id
      }
      if (token.email !== undefined) {
        session.user.email = token.email
      }
      if (token.firstName !== undefined) {
        session.user.firstName = token.firstName
      }
      if (token.lastName !== undefined) {
        session.user.lastName = token.lastName
      }
      if (token.name !== undefined) {
        session.user.name = token.name
      }
      if (token.avatar !== undefined) {
        session.user.avatar = token.avatar
      }
      if (token.accessToken !== undefined) {
        session.user.accessToken = token.accessToken
      }
      if (token.isNew !== undefined) {
        session.user.isNew = token.isNew
      }
      if (token.fbc !== undefined) {
        session.user.fbc = token.fbc
      }
      if (token.utmSource !== undefined) {
        session.user.utmSource = token.utmSource
      }
      if (token.location !== undefined) {
        session.user.location = token.location
      }
      if (token.subscriptionCycle !== undefined) {
        session.user.subscriptionCycle = token.subscriptionCycle
      }
      if (token.subscriptionStatus !== undefined) {
        session.user.subscriptionStatus = token.subscriptionStatus
      }
      if (token.nextPaymentTime !== undefined) {
        session.user.nextPaymentTime = token.nextPaymentTime
      }
      if (token.paymentCount !== undefined) {
        session.user.paymentCount = token.paymentCount
      }
      if (token.planName !== undefined) {
        session.user.planName = token.planName
      }
      if (token.planTag !== undefined) {
        session.user.planTag = token.planTag
      }
      if (token.creditsBalance !== undefined) {
        session.user.creditsBalance = token.creditsBalance
      }
      if (token.isGuest !== undefined) {
        session.user.isGuest = token.isGuest
      }
      if (token.cumulativeConsumption !== undefined) {
        session.user.cumulativeConsumption = token.cumulativeConsumption
      }
      return session
    },
  },
  events: {
    async signOut({ session, token }) {
      const userApi = new UserApi(token.accessToken)
      return await userApi.logout()
    },
  },
  cookies: {
    sessionToken: {
      name: (process.env.NODE_ENV === 'production' ? '__Secure-' : '') + 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 允许跨站点使用
        secure: process.env.NODE_ENV === 'production', // 在生产环境中启用 secure
        path: '/',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
