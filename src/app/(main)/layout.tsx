import ConditionalAuthLayout from "../../components/ConditionalAuthLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConditionalAuthLayout>{children}</ConditionalAuthLayout>;
}
