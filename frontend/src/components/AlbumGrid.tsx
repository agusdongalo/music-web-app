import { Link } from "react-router-dom";

type AlbumGridItem = {
  id: string;
  title: string;
  coverUrl?: string;
  artistName?: string;
};

type AlbumGridProps = {
  albums: AlbumGridItem[];
};

export default function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <div className="album-grid">
      {albums.map((album) => (
        <Link
          key={album.id}
          className="album-card"
          to={`/album/${album.id}`}
        >
          <div className="album-cover">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} />
            ) : (
              <div className="album-placeholder" />
            )}
          </div>
          <div className="album-title">{album.title}</div>
          <div className="album-artist">{album.artistName ?? "Unknown"}</div>
        </Link>
      ))}
    </div>
  );
}
