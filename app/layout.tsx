import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecureBank - Modern Banking Solution',
  description: 'A secure banking application with user and admin functionality',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem
          > */}
            {children}
            <Toaster />
          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}