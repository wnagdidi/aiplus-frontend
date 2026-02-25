export enum PlanDuration {
  Monthly = 'monthly',
  Yearly = 'yearly',
  Lifetime = 'lifetime',
  Quarterly = 'quarterly',
}

export interface Plan {
  id: number
  name: string
  description: string
  originPriceOneMonth: number
  realPriceOneMonth: number
  months: number
  discount: number
  wordsLimitOneMonth: number
  wordsLimitOneTimes: number
  totalPrice?: string | number
  tags: string[]
  popular?: boolean
  badge?: string,
  realFullPrice: number | string
}

export interface Subscription {
  id: number
  plan: Plan
  planName: string
  wordsLimitTotal: number
  wordsLimitOneTimes: number
  currentMonthUsage: number
  startTime: string
  endTime: string
  isFree: boolean
  autoRenewal?: boolean
}
