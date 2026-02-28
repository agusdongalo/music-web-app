import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./app.css";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import NowPlayingPanel from "../components/NowPlayingPanel";
import RequireAuth from "../components/RequireAuth";
import AudioPlayer from "../components/AudioPlayer";
import HomePage from "../pages/Home";
import SearchPage from "../pages/Search";
import ArtistPage from "../pages/Artist";
import AlbumPage from "../pages/Album";
import PlaylistPage from "../pages/Playlist";
import AudiusPlaylistPage from "../pages/AudiusPlaylist";
import LibraryPage from "../pages/Library";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <TopBar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/album/:id" element={<AlbumPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/audius/playlist/:id" element={<AudiusPlaylistPage />} />
              <Route
                path="/library"
                element={
                  <RequireAuth>
                    <LibraryPage />
                  </RequireAuth>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </div>
        </div>
        <NowPlayingPanel />
      </div>
      <PlayerBar />
      <AudioPlayer />
    </BrowserRouter>
  );
}
