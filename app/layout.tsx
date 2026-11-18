import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Mirha Collection By BZ | Premium Fashion",
  description: "Discover thoughtfully selected fashion at Mirha Collection By BZ. Shop with confidence across Pakistan.",
  metadataBase: new URL("https://mirha-collection.pages.dev")
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}