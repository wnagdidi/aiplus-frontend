
import FeeLoveLayout from '@/components/layout/FeeLoveLayout'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import BillingApi from '@/api/server/billingApi'
import PricingSectionWrapper from '@/app/[locale]/feelove-pricing/PricingSectionWrapper'
import Link from 'next/link'

export default async function FeeLovePricingPage() {
  // 检查环境变量 NEXT_PUBLIC_CLOAK
  const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'

  const session = await getServerSession(authOptions as any)
  const accessToken = (session as any)?.user?.accessToken as string | undefined
  const billingApi = new BillingApi(accessToken || '')
  const plans = await billingApi.getPlans()

  return (
    <FeeLoveLayout>
      <div className="p-4 md:p-6">
        {/* Pricing Component from home/pricing */}
        <div>
          <PricingSectionWrapper plans={plans} />
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-5">
          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FAQ Item 1 */}
              <div className="bg-[#1a1a24]/50 p-6 rounded-lg">
                <h3 className="font-semibold text-white">Can I cancel my subscription anytime?</h3>
                <p className="mt-2 text-white/60">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
              </div>
              {/* FAQ Item 2 */}
              <div className="bg-[#1a1a24]/50 p-6 rounded-lg">
                <h3 className="font-semibold text-white">How fast is video generation?</h3>
                <p className="mt-2 text-white/60">Most videos are generated within 30-60 seconds. Pro users get priority processing for even faster results.</p>
              </div>
              {/* FAQ Item 3 */}
              <div className="bg-[#1a1a24]/50 p-6 rounded-lg">
                <h3 className="font-semibold text-white">What video formats are supported?</h3>
                <p className="mt-2 text-white/60">We generate videos in MP4 format with various quality options up to 4K for PRO subscribers.</p>
              </div>
              {/* FAQ Item 4 */}
              <div className="bg-[#1a1a24]/50 p-6 rounded-lg">
                <h3 className="font-semibold text-white">Is my content private and secure?</h3>
                <p className="mt-2 text-white/60">Absolutely. We use enterprise-grade security and your content is never shared or used for training.</p>
              </div>
            </div>
          </div>

          {/* CTA Section - Hidden when NEXT_PUBLIC_CLOAK is true */}
          {!isCloakEnabled && (
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-2xl p-12 border border-pink-500/20">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to Create Stunning Videos?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of creators who are already transforming their images into captivating videos with FeeLove.</p>
                <Link 
                  href="/generate"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white h-10 px-12 py-4 text-lg font-semibold"
                >
                  Start Creating Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 w-5 h-5" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeeLoveLayout>
  )
}
