import { AutosaveUIProvider } from "@/contexts/AutosaveUIProvider";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: Readonly<ChatLayoutProps>) {
  return <AutosaveUIProvider>{children}</AutosaveUIProvider>;
}
