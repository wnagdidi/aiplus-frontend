export interface CreatedSession {
  clientSecret: string
  orderNumber: string
}

export interface StarSaasSession {
  merchantId: string
  accountId: string
  orderNo: string
  currency: string
  amount: number
  email: string
  encryptionData: string
  returnUrl: string
  notifyUrl: string
  cancelUrl: string
}

export interface StarSaasInfo {
  order_no?: string
  currency?: string
  amount?: string
  website?: string
  items?: string
  shopper_id?: string
  shopper_email?: string
  shopper_ip?: string
  card?: string
  expiration_month?: string
  expiration_year?: string
  security_code?: string
  first_name?: string
  last_name?: string
  planTags?: string
  planName?: string
}

export interface AirwallexInfo {
  orderNo?: string
  currency?: string
  amount?: string
  planTags?: string
  planName?: string
  website?: string
  clientSecret?: string
  intentsId?: string
  mode?: string
  nextTriggeredBy?: string
  merchantTriggerTeason?: string
}
