import FeeLoveLayout from '@/components/layout/FeeLoveLayout'

export default function FeeLovePrivacyPage() {
  return (
    <FeeLoveLayout>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none text-gray-100 space-y-6">
            <p className="text-lg">At {process.env.NEXT_PUBLIC_BRAND_NAME || 'FeeLove'}, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI image-to-video generation service.</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Email address (for account registration and communication)</li>
                <li>Name (optional, for personalization)</li>
                <li>Authentication data from OAuth providers (Google, Facebook) if used</li>
                <li>Payment information (processed securely through Stripe, not stored on our servers)</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Usage Data</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Images uploaded for video generation</li>
                <li>Generated video content and metadata</li>
                <li>Service usage patterns and preferences</li>
                <li>Credit purchase and consumption history</li>
                <li>Guest user trial usage (stored locally in your browser)</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Technical Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Session data and cookies</li>
                <li>Error logs and performance metrics</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and improve our AI video generation service</li>
                <li>To process payments and manage your credit balance</li>
                <li>To authenticate your account and maintain security</li>
                <li>To communicate service updates and support responses</li>
                <li>To analyze usage patterns and optimize our AI models</li>
                <li>To detect and prevent fraud, abuse, or technical issues</li>
                <li>To comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Processing</h2>
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Image and Video Storage</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Uploaded images are processed for video generation and then deleted within 24 hours</li>
                <li>Generated videos are stored securely and associated with your account</li>
                <li>You can delete your generated content at any time through your account</li>
                <li>We use encryption in transit and at rest to protect your content</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Guest User Data</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Guest trial data is stored locally in your browser using localStorage</li>
                <li>No personal information is collected during guest usage</li>
                <li>Guest-generated content is not permanently stored on our servers</li>
                <li>Clearing browser data will reset your guest trial status</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Database Security</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal data is stored in secure, encrypted databases</li>
                <li>Access is restricted to authorized personnel only</li>
                <li>Regular security audits and updates are performed</li>
                <li>Data backups are encrypted and stored securely</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Authentication Providers</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Google OAuth: For secure sign-in using your Google account</li>
                <li>Facebook OAuth: For secure sign-in using your Facebook account</li>
                <li>NextAuth.js: For managing authentication sessions securely</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Payment Processing</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Stripe: Handles all payment processing and credit card data</li>
                <li>We do not store payment card information on our servers</li>
                <li>Payment data is subject to Stripe's privacy policy and PCI DSS compliance</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Analytics and Monitoring</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Service performance monitoring for system reliability</li>
                <li>Anonymous usage analytics to improve our AI models</li>
                <li>Error tracking to identify and fix technical issues</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies and Tracking</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Essential cookies for authentication and session management</li>
                <li>Preference cookies to remember your settings and choices</li>
                <li>Analytics cookies to understand how you use our service (anonymized)</li>
                <li>You can control cookie preferences through your browser settings</li>
                <li>Disabling essential cookies may impact service functionality</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Sharing and Disclosure</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share data only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>With your explicit consent for specific purposes</li>
                <li>To comply with legal obligations, court orders, or regulatory requirements</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>In connection with a business transfer, merger, or acquisition</li>
                <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Privacy Rights</h2>
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Access and Control</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>View and download your personal data through your account settings</li>
                <li>Update or correct your account information at any time</li>
                <li>Delete your generated content and account data</li>
                <li>Export your data in a portable format upon request</li>
              </ul>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Communication Preferences</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Opt out of promotional emails while keeping essential service communications</li>
                <li>Control notification preferences through your account settings</li>
                <li>Unsubscribe from marketing communications at any time</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Account data is retained while your account is active</li>
                <li>Generated videos are kept until you delete them or close your account</li>
                <li>Payment records are retained as required by law and accounting standards</li>
                <li>Usage logs and analytics data are retained for service improvement purposes</li>
                <li>Data is securely deleted when no longer needed or upon account closure</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
              <p>Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete such information.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Security Measures</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Employee training on data protection best practices</li>
                <li>Incident response procedures for security breaches</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes through email or a notice on our website. Your continued use of our service constitutes acceptance of the updated policy.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, want to exercise your privacy rights, or need to report a privacy concern, please contact us at:</p>
              <ul className="list-none space-y-2 mt-4">
                <li>Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</li>
                <li>Privacy Officer: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</li>
              </ul>
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