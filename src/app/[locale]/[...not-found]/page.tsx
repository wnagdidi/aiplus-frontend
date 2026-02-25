'use client'

// import { useRouter } from "@/components/next-intl-progress-bar";
import { useEffect } from "react";
import { notFound } from 'next/navigation';

export default function Custom404() {

  // const router = useRouter();

  // useEffect(() => {
  //   // 在 404 页面加载后立即重定向到首页
  //   router.push('/');
  // }, [router]);

  // return null
  notFound()
}