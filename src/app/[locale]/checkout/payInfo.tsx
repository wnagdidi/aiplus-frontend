import { StarSaasInfo } from '@/api/client/billingApi.interface'
import { useTranslations } from '@/hooks/useTranslations'
import MoneyBackGuarantee from '@/app/[locale]/pricing/moneyBackGuarantee'
import { isMobile } from '@/util/browser'

interface PayInfoProps {
  paymentSession?: StarSaasInfo
}

export default function PayInfo({ paymentSession }: PayInfoProps) {
  const tPayRegister = useTranslations('PayRegister')

  const getPlanType = (typeStr?: string) => {
    console.log(typeStr)
    const type = typeStr?.split(" ")[1]
    return type
  }

  const getbilledMap = (type?: string, money?: string) => {
    const dataMap: {
      [propName: string]: string
    } = {
      yearly: paymentSession?.currency + ' ' + (Number(money) * 100 / 12 / 100.0).toFixed(2) + '/month',
      monthly: paymentSession?.currency + ' ' + (Number(money) * 100 / 1 / 100.0).toFixed(2) + '/month',
      quarterly: paymentSession?.currency + ' ' + (Number(money) * 100 / 3 / 100.0).toFixed(2) + '/month',
      lifetime: 'Pay for 2 years, and get lifetime access!',
    }

    if (!type) return

    return dataMap[type]
  }

  const getBestUserMap = (type?: string) => {
    const dataMap: {
      [propName: string]: string
    } = {
      Starter: 'Best for Starter',
      Basic: 'Best for Beginner',
      Pro: 'Best for Active Writer',
      Unlimited: 'Best for Everyday Writer',
    }

    if (!type) return

    return dataMap[type]
  }
  return (
    <div>
      <div className="ml-2">
        <div className="text-[15px] text-[hsl(0,0%,46%)] font-bold">Subscribe to {paymentSession?.planName}</div>
        <div className="flex items-center">
          <div className="text-[30px] font-bold mr-2">{paymentSession?.currency} {paymentSession?.amount}</div>
          <div className="flex flex-col text-[14px] text-[hsl(0,0%,46%)] font-bold">
            <div>{paymentSession?.planTags === 'yearly' ? 'per' : ''}</div>
            <div>{paymentSession?.planTags}</div>
          </div>
        </div>
        <div className="text-[14px] text-[#444]">
          {paymentSession?.amount && getbilledMap(
            paymentSession?.planTags,
            paymentSession?.amount
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col w-full">
          {
            isMobile() ? "" : (
              <div className="border rounded p-2 mt-[30px]">
                <div className="flex justify-between text-[14px] font-bold">
                  <div>{paymentSession?.planName}</div>
                  <div>{paymentSession?.currency} {paymentSession?.amount}</div>
                </div>
                <div className="text-[12px] text-gray-500">{getBestUserMap(getPlanType(paymentSession?.planName))}</div>
                <div className="text-[12px] text-gray-500">
                  {paymentSession?.planTags == 'lifetime'
                    ? 'Billed only 1 time'
                    : `Billed every ${paymentSession?.planTags}`}
                </div>
              </div>
            )
          }

          <div className="p-2">
            <div className="flex justify-between font-bold">
              <span className="text-[14px]">Total due today</span>
              <span className="text-[14px]">{paymentSession?.currency} {paymentSession?.amount}</span>
            </div>
          </div>
          <hr className="my-5" />
          <div className="flex justify-center rounded">
            <MoneyBackGuarantee />
          </div>
        </div>
      </div>
    </div>
  )
}
