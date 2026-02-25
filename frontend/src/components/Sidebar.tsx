export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Music App</h1>
      <nav className="sidebar-nav">
        <a href="/">Home</a>
        <a href="/search">Search</a>
        <a href="/library">Your Library</a>
      </nav>
    </aside>
  );
}
