import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProfilePanel } from "@/components/ProfilePanel";

interface ProfilePageProps {
  params: Promise<{ address?: string[] }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { address } = await params;
  const addressParam = address?.[0];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 pt-24 pb-32">
        <ProfilePanel addressParam={addressParam} />
      </main>
      <BottomNav />
    </>
  );
}
