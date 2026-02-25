import FeeLoveLayout from '@/components/layout/FeeLoveLayout'

export default function FeeLoveTermsPage() {
  return (
    <FeeLoveLayout>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Terms of Service</h1>
          <div className="prose prose-invert max-w-none text-gray-100 space-y-6">
            <p className="text-lg">By using {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'} ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.</p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Service Description</h2>
              <p>{process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'} is an artificial intelligence-powered platform that transforms static images into dynamic videos. Our service uses advanced AI technology to create video content based on user-uploaded images.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility and Account Registration</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must be at least 18 years old to use our service</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>Guest users receive 1 free trial generations before registration is required</li>
                <li>One account per person is permitted</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Subscription Plans and Payments</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Our service operates on a monthly subscription model with AI video credits</li>
                <li>Available plans: Starter (10 credits/month - $30), Creator (40 credits/month - $100), Studio (100 credits/month - $200)</li>
                <li>Subscriptions automatically renew every 30 days unless canceled</li>
                <li>Monthly credits reset at the beginning of each billing cycle</li>
                <li>Unused credits do not roll over to the next billing period</li>
                <li>You may upgrade, downgrade, or cancel your subscription at any time</li>
                <li>Payments are processed securely through Stripe</li>
                <li>Cancellations take effect at the end of the current billing cycle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
              <p>You agree NOT to use our service for:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Uploading images containing illegal, harmful, threatening, or offensive content</li>
                <li>Creating content that violates copyright or intellectual property rights</li>
                <li>Generating content involving minors in inappropriate contexts</li>
                <li>Creating deepfakes or misleading content intended to deceive</li>
                <li>Uploading images containing violence, explicit sexual content, or hate speech</li>
                <li>Using the service for commercial purposes without prior written consent</li>
                <li>Attempting to reverse engineer, hack, or abuse our AI systems</li>
                <li>Sharing account credentials or reselling credits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Content Ownership and Licensing</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You retain ownership of images you upload to our platform</li>
                <li>You grant us a limited license to process your images for video generation</li>
                <li>Generated videos belong to you, subject to these Terms</li>
                <li>You are responsible for ensuring you have rights to any uploaded content</li>
                <li>Monthly credits are non-transferable between accounts or billing periods</li>
                <li>We reserve the right to remove content that violates these Terms</li>
                <li>You may not upload copyrighted material without proper authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. AI-Generated Content Disclaimer</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All videos are generated using artificial intelligence technology</li>
                <li>We do not guarantee the accuracy, quality, or suitability of generated content</li>
                <li>AI-generated content may contain artifacts, errors, or unexpected results</li>
                <li>You use AI-generated content at your own risk and discretion</li>
                <li>We are not responsible for how you use or distribute generated videos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy and Data Protection</h2>
              <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability and Performance</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We provide our service on an “as is” and “as available” basis</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>Service may be temporarily unavailable for maintenance or technical issues</li>
                <li>Generation times may vary based on system load and complexity</li>
                <li>We reserve the right to modify or discontinue features with notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
              <p>You agree to indemnify and hold harmless {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'} from any claims, damages, or expenses arising from your use of our service, violation of these Terms, or infringement of any third-party rights.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We may terminate or suspend your account for violation of these Terms</li>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Upon termination, your access to the service will cease at the end of the current billing period</li>
                <li>Unused monthly credits will be forfeited upon account termination or cancellation</li>
                <li>Subscription refunds are handled according to our refund policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
              <p>These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p>If you have questions about these Terms, please contact us at: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</p>
            </section>

            <footer className="mt-12 pt-8 border-t border-white/20 text-center text-gray-300">
              <p>Last updated: 1/21/2026</p>
            </footer>
          </div>
        </div>
      </div>
    </FeeLoveLayout>
  )
}
