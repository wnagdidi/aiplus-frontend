'use client'
import { notFound } from 'next/navigation';
import { useRouter } from "@/components/next-intl-progress-bar"
import { isHomePage } from "@/util/api"
import { usePathname } from "next/navigation"

const RedirectHome = () => {

  const pathName = usePathname()
  const router = useRouter()
  
  if(!isHomePage(pathName)) {
    // return null
    // router.push('/')
    notFound()
  }
  return null
}

export default RedirectHome;