"use client";

import type { MasteryKey } from "@/types/speaking";
import { MASTERY_LABELS } from "@/types/speaking";

interface Props {
  selected:        MasteryKey[];
  onFilterChange:  (keys: MasteryKey[]) => void;
}

const ALL_MASTERIES: MasteryKey[] = [
  "speaking",
  "manifesting",
  "ai_mastery",
  "entrepreneurship",
  "spiritual",
  "social",
];

export function MasteryFilter({ selected, onFilterChange }: Props) {
  const isAll = selected.length === ALL_MASTERIES.length;

  function toggle(key: MasteryKey) {
    if (isAll) {
      // First click off "All" → focus on just this mastery
      onFilterChange([key]);
      return;
    }
    if (selected.includes(key)) {
      const next = selected.filter((k) => k !== key);
      // Removing the last one returns to All (so the table never goes empty by accident)
      onFilterChange(next.length === 0 ? ALL_MASTERIES : next);
    } else {
      onFilterChange([...selected, key]);
    }
  }

  function selectAll() {
    onFilterChange(ALL_MASTERIES);
  }

  return (
    <div className="of-toolbar">
      <span className="of-toolbar__label">Mastery</span>
      <button
        type="button"
        className={`of-filter-chip${isAll ? " of-filter-chip--active" : ""}`}
        onClick={selectAll}
      >
        All
      </button>
      {ALL_MASTERIES.map((key) => {
        const active = !isAll && selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            className={`of-filter-chip${active ? " of-filter-chip--active" : ""}`}
            onClick={() => toggle(key)}
          >
            {MASTERY_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
