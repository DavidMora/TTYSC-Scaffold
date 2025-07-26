import { AutosaveUIProvider } from "@/contexts/AutosaveUIProvider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AutosaveUIProvider>{children}</AutosaveUIProvider>;
}
