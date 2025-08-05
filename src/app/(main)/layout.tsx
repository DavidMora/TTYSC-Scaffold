import ConditionalAuthLayout from "../../components/ConditionalAuthLayout";

export default function MainLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <ConditionalAuthLayout>{children}</ConditionalAuthLayout>;
}
