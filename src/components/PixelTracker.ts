'use client'
// components/PixelTracker.ts
import { useEffect } from "react";
import { usePathname } from 'next/navigation';

const PixelTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const initializePixel = async () => {
      try {
        const ReactPixel = await import('react-facebook-pixel').then((x) => x.default);
        const pixelId = process.env.NEXT_PUBLIC_PIXEL_ID || "";
        console.log('Initializing Facebook Pixel with ID:', pixelId);

        // 检查是否已经初始化
        if (!window.fbq) {
          ReactPixel.init(pixelId, undefined, {
            autoConfig: true,
            debug: true
          });
          console.log('Facebook Pixel initialized successfully');
        } else {
          console.log('Facebook Pixel already initialized');
        }

        // 确保 fbq 函数存在
        if (typeof window.fbq === 'function') {
          ReactPixel.pageView();
          console.log('Facebook Pixel pageView event sent');
        } else {
          console.error('fbq function not found');
        }
      } catch (error) {
        console.error('Error in Facebook Pixel initialization:', error);
      }
    };

    initializePixel();
  }, [pathname]);

  return null;
};

export default PixelTracker;
