import { Metadata } from "next";
import { ProfileManager } from "@/components/admin/profile-manager";

export const metadata: Metadata = {
  title: "Profil Admin - RRI Padang Info Board",
  description: "Kelola informasi akun dan kredensial administrator RRI Padang.",
};

export default function ProfilePage() {
  return <ProfileManager />;
}
