import { Footer, Navbar } from '@/components';
import "./globals.css";

export const metadata = {
  title: "andre arcaina",
  description: "my portfolio website :D",
  icons: [{ url: '/images/icon.ico', rel: 'icon' }]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="md:flex font-mono bg-slate-700">
        <Navbar />
        
        <main className="flex-grow px-[1.25rem] md:px-9 py-6 md:py-8">
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
