'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const version = '2.0.0';
    const currentVersion = localStorage.getItem('app_version');

    if (currentVersion !== version) {
      localStorage.removeItem('imageRecords');
      localStorage.removeItem('tasks');
      localStorage.setItem('app_version', version);
      console.log('已清理旧版本数据');
    }
  }, []);

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
