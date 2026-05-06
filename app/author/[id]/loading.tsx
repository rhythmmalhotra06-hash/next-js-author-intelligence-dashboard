export default function AuthorLoading() {
  return (
    <div className="of-section">
      <div className="of-skel of-skel--text" style={{ width: 160, marginBottom: 24 }} />

      <div style={{ marginBottom: 32 }}>
        <div className="of-skel of-skel--title" style={{ width: 280, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="of-skel of-skel--text" style={{ width: 80 }} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="of-card" style={{ padding: 16 }}>
            <div className="of-skel of-skel--text" style={{ width: "60%", marginBottom: 10 }} />
            <div className="of-skel of-skel--title" />
          </div>
        ))}
      </div>

      <div className="of-skel of-skel--text" style={{ width: 200, marginBottom: 16 }} />
      <div className="of-table-wrap" style={{ padding: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="of-skel of-skel--row" />
        ))}
      </div>
    </div>
  );
}
