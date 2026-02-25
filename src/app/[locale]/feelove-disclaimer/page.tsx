import FeeLoveLayout from '@/components/layout/FeeLoveLayout'

export default function FeeLoveDisclaimerPage() {
  return (
    <FeeLoveLayout>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Disclaimer</h1>
          <div className="prose prose-invert max-w-none text-gray-100 space-y-6">
            <p className="text-lg font-medium bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <strong>Important Notice:</strong> By using {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'}'s image-to-video generation service, you acknowledge and accept the following disclaimers. Please read carefully before proceeding with any transactions or content generation.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Nature of AI-Generated Content</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All videos are generated using artificial intelligence technology and machine learning models</li>
                <li>AI-generated content is synthetic and may not accurately represent real-world physics, movements, or scenarios</li>
                <li>Generated videos may contain visual artifacts, inconsistencies, or unexpected behaviors</li>
                <li>We do not guarantee the accuracy, realism, or quality of any AI-generated content</li>
                <li>Results may vary significantly based on input image quality, complexity, and AI model limitations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Content Authenticity and Misuse Prevention</h2>
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-red-200 mb-2">⚠️ Deepfake and Misuse Warning</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Generated content must not be used to create misleading or deceptive material</li>
                  <li>Creating deepfakes of real people without consent is strictly prohibited</li>
                  <li>Users must clearly label AI-generated content when sharing publicly</li>
                  <li>Misuse for fraud, impersonation, or malicious purposes will result in account termination</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Service Availability and Performance</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Our service is provided on an "as-is" and "as-available" basis without warranties</li>
                <li>We do not guarantee uninterrupted service, consistent generation times, or error-free operation</li>
                <li>Video generation may fail due to technical limitations, server capacity, or content policy violations</li>
                <li>Service interruptions may occur for maintenance, updates, or unexpected technical issues</li>
                <li>We reserve the right to modify, suspend, or discontinue any feature with or without notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Subscription Plans</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Monthly subscriptions: Starter ($30/month, 10 credits), Creator ($100/month, 40 credits), Studio ($200/month, 100 credits)</li>
                <li>Credits are consumed when video generation is initiated, regardless of output quality or success</li>
                <li>Monthly credits reset at the beginning of each billing cycle and do not roll over</li>
                <li>Credits are non-transferable between accounts and cannot be exchanged for cash</li>
                <li>Failed generations due to technical errors will not automatically refund credits</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">Billing and Cancellation</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Subscriptions automatically renew every 30 days unless canceled</li>
                <li>You may cancel your subscription at any time through account settings</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No partial refunds for mid-cycle cancellations</li>
                <li>Unused credits are forfeited upon cancellation</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">Refund Policy</h3>
              <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
                <p className="font-semibold text-blue-200 mb-2">Limited Refund Conditions</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Eligible for refund:</strong> Duplicate charges, system errors preventing service delivery, billing errors</li>
                  <li><strong>Not eligible:</strong> Dissatisfaction with AI output quality, user error, successful deliveries, mid-cycle cancellations</li>
                  <li><strong>Timeframe:</strong> Refund requests must be submitted within 7 days of billing date</li>
                  <li><strong>Process:</strong> Contact {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'} with subscription ID and detailed explanation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. User Responsibility and Content Guidelines</h2>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Content Ownership and Rights</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>You must own or have legal rights to all uploaded images</li>
                <li>You are solely responsible for ensuring uploaded content does not infringe copyrights</li>
                <li>You assume full liability for any legal consequences arising from your content usage</li>
                <li>Generated videos inherit any legal limitations of the source images</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">Prohibited Content</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Images containing minors, explicit sexual content, or illegal material</li>
                <li>Copyrighted images without proper authorization or fair use justification</li>
                <li>Content promoting violence, hatred, discrimination, or illegal activities</li>
                <li>Images obtained without consent from private individuals</li>
                <li>Content that violates platform policies of intended distribution channels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Technical Limitations and Quality Expectations</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Video quality depends on input image resolution, clarity, and complexity</li>
                <li>AI models have inherent limitations in understanding context, physics, and realistic motion</li>
                <li>Generated content may exhibit unnatural movements, visual glitches, or incomplete transformations</li>
                <li>Processing times vary based on system load and may exceed estimated timeframes</li>
                <li>Some images may be unsuitable for video generation due to technical constraints</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                <p className="text-sm"><strong>MAXIMUM LIABILITY:</strong> In no event shall {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'} be liable for any damages exceeding the amount you paid for subscriptions in the 12 months preceding the claim. We disclaim all liability for:</p>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, reputation, or business opportunities</li>
                  <li>Misuse of generated content by users or third parties</li>
                  <li>Legal consequences arising from content creation or distribution</li>
                  <li>Service interruptions, data loss, or technical failures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property Considerations</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Generated videos may inadvertently resemble existing copyrighted works</li>
                <li>Users are responsible for conducting due diligence on potential copyright conflicts</li>
                <li>We do not provide legal advice regarding intellectual property rights</li>
                <li>Commercial use of generated content requires independent legal assessment</li>
                <li>AI training data may include copyrighted material under fair use provisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Guest User Limitations</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Guest users receive 1 free trial generations with limited features</li>
                <li>Trial content may be deleted automatically after the trial period</li>
                <li>No data recovery services are provided for guest-generated content</li>
                <li>Guest usage is tracked locally and may be reset by browser data clearing</li>
                <li>Support services are limited for non-registered users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Third-Party Integrations</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Authentication via Google and Facebook is subject to their respective terms and policies</li>
                <li>Payment processing by Stripe operates under separate terms and privacy policies</li>
                <li>We are not responsible for third-party service availability or security</li>
                <li>Integration failures may temporarily affect service functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Data Security and Privacy</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>While we implement security measures, no online service is 100% secure</li>
                <li>Users should not upload sensitive, confidential, or private information</li>
                <li>Uploaded images are processed temporarily and deleted according to our retention policy</li>
                <li>Generated content is stored securely but users should maintain their own backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Legal Compliance</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Users must comply with all applicable local, national, and international laws</li>
                <li>Content generation for illegal purposes is strictly prohibited</li>
                <li>We cooperate with law enforcement when legally required</li>
                <li>Violations may result in account termination and legal action</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Updates and Modifications</h2>
              <p>This disclaimer may be updated periodically to reflect changes in our service, technology, or legal requirements. Continued use of our service after updates constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact and Support</h2>
              <p>For questions about this disclaimer, technical support, or to report misuse:</p>
              <ul className="list-none space-y-2 mt-4">
                <li>General Support: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</li>
                <li>Legal Issues: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</li>
                <li>Abuse Reports: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</li>
              </ul>
            </section>

            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold text-red-200 mb-3">⚠️ Final Warning</h3>
              <p className="text-red-100">By proceeding to use {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'}, you acknowledge that you have read, understood, and agree to be bound by this disclaimer along with our Terms of Service and Privacy Policy. You accept full responsibility for your use of AI-generated content and any consequences thereof.</p>
            </div>

            <footer className="mt-12 pt-8 border-t border-white/20 text-center text-gray-300">
              <p>Last updated: 1/21/2026</p>
            </footer>
          </div>
        </div>
      </div>
    </FeeLoveLayout>
  )
}