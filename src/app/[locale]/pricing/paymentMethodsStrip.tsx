import * as React from 'react'

type RawPaymentMethod = {
  id?: string
  name?: string
  icon?: string
  paymentMethodCode?: string
  paymentMethodName?: string
}

const fallbackMethods: RawPaymentMethod[] = [
  { id: 'paypal', paymentMethodName: 'PayPal' },
  { id: 'googlepay', paymentMethodName: 'Google Pay' },
  { id: 'applepay', paymentMethodName: 'Apple Pay' },
  { id: 'cashapp', paymentMethodName: 'Cash App' },
  { id: 'usdt', paymentMethodName: 'USDT' },
]

const getPaymentIcon = (method: RawPaymentMethod): string | null => {
  const name = String(method?.paymentMethodName || method?.name || '').toLowerCase()
  const id = String(method?.id || '').toLowerCase()

  // skip "aggregator" methods where we shouldn't render a specific icon
  if (name.includes('国际主流支付平台') || name.includes('international') || name.includes('主流支付')) {
    return null
  }

  if (name.includes('cash app') || name.includes('cashapp') || id.includes('cashapp') || id.includes('cash')) {
    return '/feelove/pay/cashapp.svg'
  }
  if (name.includes('paypal') || id.includes('paypal')) {
    return '/feelove/pay/paypal-icon.svg'
  }
  if (name.includes('google pay') || id.includes('googlepay') || id.includes('google')) {
    return '/feelove/pay/google-pay-icon.svg'
  }
  if (name.includes('apple pay') || id.includes('applepay') || id.includes('apple')) {
    return '/feelove/pay/apple-pay-icon.svg'
  }
  if (name.includes('usdt') || name.includes('加密货币') || id.includes('usdt') || id.includes('crypto')) {
    return '/feelove/pay/usdt.svg'
  }

  return null
}

function getMethodLabel(method: RawPaymentMethod): string {
  return String(method?.paymentMethodName || method?.name || method?.id || '').trim() || 'Payment'
}

export default function PaymentMethodsStrip({
  methods,
  className,
  label = 'Secure checkout',
}: {
  methods?: RawPaymentMethod[]
  className?: string
  label?: string
}) {
  const input = (methods && methods.length ? methods : fallbackMethods) ?? fallbackMethods
  const iconMethods = input
    .map((m) => ({ method: m, icon: getPaymentIcon(m) }))
    .filter((x): x is { method: RawPaymentMethod; icon: string } => Boolean(x.icon))
    .slice(0, 6)

  if (iconMethods.length === 0) return null

  return (
    <div className={['flex justify-center my-6', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col items-center gap-4">
        <div className="pt-2 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            {iconMethods.map(({ method, icon }) => {
              const name = getMethodLabel(method)
              return (
                <div
                  key={`${method.id || name}-${icon}`}
                  className="group relative flex items-center justify-center shrink-0 p-2 bg-white/80 rounded-full border border-white/30 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 hover:border-blue-400 transition-all duration-200 cursor-pointer w-12 h-12"
                  role="img"
                  aria-label={`Pay with ${name}`}
                  title={name}
                >
                  <div className="relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={name}
                      src={icon}
                      width={30}
                      height={30}
                      className="object-contain"
                      style={{ width: 30, height: 30 }}
                    />
                  </div>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900/90 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                    {name}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex justify-center">
            <span className="text-sm text-[#f5f5f5]">{label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

