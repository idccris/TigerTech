import type { Metadata } from "next";
import AdminLightTheme from "../../components/admin-light-theme";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminLightTheme />
      {children}
    </>
  );
}
