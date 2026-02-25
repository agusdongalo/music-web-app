import ArtistHeader from "../components/ArtistHeader";
import TrackRow from "../components/TrackRow";

export default function ArtistPage() {
  return (
    <section>
      <ArtistHeader
        name="Midnight Echoes"
        bio="Dreamy synth-pop with cinematic textures."
        imageUrl="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
      />
      <div>
        <h3>Popular</h3>
        <TrackRow title="City Skyline" artist="Midnight Echoes" duration="3:35" />
      </div>
    </section>
  );
}
