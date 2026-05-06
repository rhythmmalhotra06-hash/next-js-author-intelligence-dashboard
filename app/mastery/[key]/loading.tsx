export default function MasteryLoading() {
  return (
    <div className="of-section">
      <div className="of-skel of-skel--text" style={{ width: 160, marginBottom: 16 }} />
      <div style={{ marginBottom: 32 }}>
        <div className="of-skel of-skel--title" style={{ width: 240, marginBottom: 8 }} />
        <div className="of-skel of-skel--text" style={{ width: 280 }} />
      </div>
      <div className="of-card" style={{ padding: 24 }}>
        <div className="of-skel of-skel--text" style={{ width: 200, marginBottom: 16 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="of-skel of-skel--row" />
        ))}
      </div>
    </div>
  );
}
