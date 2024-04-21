import { Body } from "@/components";
import "./globals.css";

export const metadata = {
  title: "andre arcaina",
  description: "my portfolio website :D",
  icons: [{ url: '/images/icon.ico', rel: 'icon' }]
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <Body>
          {children}
        </Body>
      </html>
  );
}
