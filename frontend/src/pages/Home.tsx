import AlbumGrid from "../components/AlbumGrid";

const demoAlbums = [
  {
    id: "demo-1",
    title: "First Light",
    artistName: "Midnight Echoes",
    coverUrl: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
  },
  {
    id: "demo-2",
    title: "Night Drive",
    artistName: "Neon Drift",
    coverUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885",
  },
];

export default function HomePage() {
  return (
    <section>
      <h2>Made for you</h2>
      <AlbumGrid albums={demoAlbums} />
    </section>
  );
}
