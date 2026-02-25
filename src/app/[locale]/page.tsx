import FeeLovePage from '@/app/[locale]/feelove/page'
import { homepageLDScript } from '@/app/[locale]/pageLD'
import ReactGA from "react-ga4";
import PixelTracker from '@/components/PixelTracker'
import * as process from 'process'

export default function App() {
/*  if (process.env.NEXT_PUBLIC_ENVIRONMENT_MOD === 'test') {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID, { debug: true })
  }else {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID)
  }*/

  return (
    <>
      <PixelTracker />
      <FeeLovePage />
      {homepageLDScript}
    </>
  )
}
