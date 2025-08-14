import ConditionalAuthLayout from '../../components/ConditionalAuthLayout';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConditionalAuthLayout>{children}</ConditionalAuthLayout>;
}
