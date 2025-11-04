import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ClassProvider } from "../context/ClassContext";
import { ChapterProvider } from "../context/ChapterContext";
import { TestProvider } from "../context/TestContext";
import { AttemptProvider } from "../context/AttemptContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AnyTimeTeacher AI",
  description: "AI-powered assistant for creating comprehensive lesson plans from NCERT chapters",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-800 font-sans`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClassProvider>
            <ChapterProvider>
              <TestProvider>
                <AttemptProvider>
                  {children}
                </AttemptProvider>
              </TestProvider>
            </ChapterProvider>
          </ClassProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
