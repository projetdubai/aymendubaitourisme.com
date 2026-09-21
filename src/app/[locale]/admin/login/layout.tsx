import { ReactNode } from 'react';

export default function AdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Login page renders its own full-screen layout, no sidebar/header needed
  return <>{children}</>;
}
