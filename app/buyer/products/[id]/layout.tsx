// This file is a Server Component, so Vercel will respect this rule:
export const dynamic = 'force-dynamic';

export default function ProductDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}