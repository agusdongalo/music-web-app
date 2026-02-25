import TrackRow from "../components/TrackRow";

export default function PlaylistPage() {
  return (
    <section>
      <h2>Demo Playlist</h2>
      <p>By Demo User</p>
      <TrackRow title="City Skyline" artist="Midnight Echoes" duration="3:35" />
    </section>
  );
}
