"use client";

import type { CrossProgramFilter } from "@/types/speaking";

interface Props {
  searchQuery:        string;
  onSearchChange:     (v: string) => void;

  crossProgramFilter: CrossProgramFilter;
  onCrossProgramChange: (v: CrossProgramFilter) => void;

  minRating:          string;
  onMinRatingChange:  (v: string) => void;

  minRewatch:         string;
  onMinRewatchChange: (v: string) => void;

  maxConsistency:     string;
  onMaxConsistencyChange: (v: string) => void;

  yearFilter:         import("@/types/speaking").YearFilter;
  onYearChange:       (v: import("@/types/speaking").YearFilter) => void;

  sessionTypeFilter:  import("@/types/speaking").SessionTypeFilter;
  onSessionTypeChange:(v: import("@/types/speaking").SessionTypeFilter) => void;

  onReset:            () => void;

  totalCount:         number;
  filteredCount:      number;
  activeFilterCount:  number;
}

const CP_OPTIONS: { value: CrossProgramFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "1",   label: "1" },
  { value: "2+",  label: "2+" },
  { value: "3+",  label: "3+" },
];

export function TableControls(props: Props) {
  const hasFilters = props.activeFilterCount > 0;

  return (
    <div className="of-toolbar of-toolbar--controls">
      <div className="of-toolbar__group">
        <input
          type="text"
          className="mv-input mv-input--search"
          placeholder="Search author…"
          value={props.searchQuery}
          onChange={(e) => props.onSearchChange(e.target.value)}
        />
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Cross-program</span>
        {CP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`of-filter-chip${props.crossProgramFilter === opt.value ? " of-filter-chip--active" : ""}`}
            onClick={() => props.onCrossProgramChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Year</span>
        <select
          className="mv-input mv-input--inline"
          value={props.yearFilter}
          onChange={(e) => props.onYearChange(e.target.value as import("@/types/speaking").YearFilter)}
        >
          <option value="all">All Time</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Format</span>
        <select
          className="mv-input mv-input--inline"
          value={props.sessionTypeFilter}
          onChange={(e) => props.onSessionTypeChange(e.target.value as import("@/types/speaking").SessionTypeFilter)}
        >
          <option value="all">All Types</option>
          <option value="lesson">Lecture/Lesson</option>
          <option value="qa">Q&A</option>
          <option value="hotseat">Hotseat</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Min rating</span>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          className="mv-input mv-input--inline"
          placeholder="≥ 4.0"
          value={props.minRating}
          onChange={(e) => props.onMinRatingChange(e.target.value)}
        />
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Min rewatch %</span>
        <input
          type="number"
          step="5"
          min="0"
          max="100"
          className="mv-input mv-input--inline"
          placeholder="≥ 50"
          value={props.minRewatch}
          onChange={(e) => {
            const clamped = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
            props.onMinRewatchChange(e.target.value === "" ? "" : String(clamped));
          }}
        />
      </div>

      <div className="of-toolbar__group">
        <span className="of-toolbar__label">Max consistency</span>
        <input
          type="number"
          step="0.05"
          min="0"
          max="5"
          className="mv-input mv-input--inline"
          placeholder="≤ 0.5"
          value={props.maxConsistency}
          onChange={(e) => props.onMaxConsistencyChange(e.target.value)}
        />
      </div>

      <div className="of-toolbar__spacer" />

      <span className="of-table__muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
        {props.filteredCount === props.totalCount
          ? `${props.totalCount} authors`
          : `${props.filteredCount} of ${props.totalCount} authors`}
      </span>

      {hasFilters && (
        <span className="mv-badge mv-badge--brand" style={{ fontSize: 11 }}>
          {props.activeFilterCount} filter{props.activeFilterCount !== 1 ? "s" : ""} active
        </span>
      )}

      <button
        type="button"
        className={`mv-btn mv-btn--sm ${hasFilters ? "mv-btn--secondary" : "mv-btn--ghost"}`}
        onClick={props.onReset}
      >
        Reset
      </button>
    </div>
  );
}
