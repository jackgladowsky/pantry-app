import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Pantry",
  description: "Kitchen inventory & recipe manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} min-h-screen`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
