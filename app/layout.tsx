import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Dashboard | 개발자 채용 큐레이션",
  description: "점핏, 사람인, 원티드의 최신 개발자 채용 공고를 한눈에 확인하세요. 기술 스택별 필터링과 찜하기 기능을 제공합니다.",
  keywords: ["개발자 채용", "프론트엔드", "백엔드", "점핏", "사람인", "원티드"],
  openGraph: {
    title: "Dev Dashboard | 개발자 채용 큐레이션",
    description: "매일 아침 업데이트되는 개발자 맞춤형 채용 정보와 기술 트렌드",
    type: "website",
    locale: "ko_KR",
    siteName: "Dev Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-OOOOOOOOOOOOOOOO"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}