type ArtistHeaderProps = {
  name: string;
  imageUrl?: string;
  bio?: string;
};

export default function ArtistHeader({ name, imageUrl, bio }: ArtistHeaderProps) {
  return (
    <section className="artist-header">
      <div className="artist-image">
        {imageUrl ? <img src={imageUrl} alt={name} /> : <div />}
      </div>
      <div>
        <h2>{name}</h2>
        <p>{bio ?? "No bio available yet."}</p>
      </div>
    </section>
  );
}
