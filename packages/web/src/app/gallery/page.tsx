import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { GalleryPanel } from "@/components/GalleryPanel";

export default function GalleryPage() {
	return (
		<>
			<Header />
			<main className="mx-auto max-w-md px-4 pt-24 pb-32">
				<GalleryPanel />
			</main>
			<BottomNav />
		</>
	);
}
