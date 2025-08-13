import { notFound } from 'next/navigation';

export default function NotFoundPage() {
  // This will trigger Next.js's 404 handling
  notFound();
}
