import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import {standalonePageContentStyle} from '@/app/[locale]/styles'
import LoginCard from "@/app/[locale]/login/loginCard";
import {defaultLDScript} from "@/app/[locale]/pageLD";
import {getTranslations} from '@/hooks/getTranslations'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.login')
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  }
}

export default function LoginPage() {
  const backgroundGradient = {
    background: '#1e1e2e',
    backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
  }
  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground" style={backgroundGradient}>
        <div className="max-w-7xl mx-auto min-h-[100vh] pt-37 px-4 py-24">
          <div className="max-w-2xl mx-auto" style={standalonePageContentStyle as any}>
            <LoginCard />
          </div>
        </div>
        <Footer />
      </div>
      {defaultLDScript}
    </>
  )
}
