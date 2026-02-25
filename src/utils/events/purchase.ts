import { Session } from 'next-auth'
import { handleEvent } from './handleEvent'

/**
 *     view_item: 'ViewContent',
    start_trial: 'StartTrial',
    sign_up: 'CompleteRegistration',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    add_payment_info: 'AddPaymentInfo',
    purchase: 'Purchase',
  }

 */

/**
 * 处理添加到购物车事件
 */
export const handleAddToCartEvent = async (session: Session | null, data: any): Promise<any> => {
  data.event = 'AddToCart'
  return handleEvent(session, data, 'AddToCart')
}

/**
 * 处理开始结账事件
 */
export const handleBeginCheckoutEvent = async (session: Session | null, data: any): Promise<any> => {
  data.event = 'InitiateCheckout'
  return handleEvent(session, data, 'InitiateCheckout')
}

/**
 * 处理添加支付信息事件
 */
export const handleAddPaymentInfoEvent = async (session: Session | null, data: any): Promise<any> => {
  data.event = 'AddPaymentInfo'
  return handleEvent(session, data, 'AddPaymentInfo')
}

/**
 * 处理完成购买事件
 */
export const handlePurchaseEvent = async (session: Session | null, data: any): Promise<any> => {
  data.event = 'Purchase'
  return handleEvent(session, data, 'Purchase')
}
