import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拼豆乐｜手机拼豆",
  description: "在手机上玩拼豆，随时创作自己的像素作品"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}