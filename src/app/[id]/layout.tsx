import { AutosaveUIProvider } from "@/contexts/AutosaveUIProvider";

export default function ChatLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <AutosaveUIProvider>{children}</AutosaveUIProvider>;
}
