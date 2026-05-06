export default function OverviewLoading() {
  return (
    <div className="of-page">
      <div className="of-page__header">
        <div>
          <div className="of-skel of-skel--text" style={{ width: 140, marginBottom: 10 }} />
          <div className="of-skel of-skel--title" style={{ width: 300, marginBottom: 10 }} />
          <div className="of-skel of-skel--text" style={{ width: 420 }} />
        </div>
      </div>

      <div className="of-section">
        <div className="of-metrics">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="of-metric">
              <div className="of-skel of-skel--text" style={{ width: "60%", marginBottom: 10 }} />
              <div className="of-skel of-skel--title" style={{ marginBottom: 6 }} />
              <div className="of-skel of-skel--text" style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      </div>

      <div className="of-section">
        <div className="of-skel of-skel--text" style={{ width: 180, marginBottom: 16 }} />
        <div className="of-table-wrap" style={{ padding: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="of-skel of-skel--row" />
          ))}
        </div>
      </div>
    </div>
  );
}
