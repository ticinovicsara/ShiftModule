export const PRIORITY_WEIGHTS = {
  gpa: 0.5,
  time: 0.3,
  attempts: 0.2,
} as const;

export type PriorityWeights = typeof PRIORITY_WEIGHTS;

export type PriorityRequestSnapshot = {
  requestId: string;
  gpa: number;
  createdAt: Date;
  previousRejectedAttempts: number;
};

export type RankedPriorityRequest = PriorityRequestSnapshot & {
  gpaRank: number;
  timeRank: number;
  attemptsRank: number;
  weightedRank: number;
};

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function getGpaWithFallback(gpa?: number): number {
  if (typeof gpa !== 'number' || Number.isNaN(gpa)) {
    return 3.0;
  }

  return clamp01(gpa / 5) * 5;
}

export function buildRankMap(
  rows: PriorityRequestSnapshot[],
  selector: (row: PriorityRequestSnapshot) => number,
  direction: 'asc' | 'desc',
): Map<string, number> {
  const sorted = [...rows].sort((a, b) => {
    const aValue = selector(a);
    const bValue = selector(b);

    if (aValue === bValue) {
      return a.requestId.localeCompare(b.requestId);
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const rankById = new Map<string, number>();
  sorted.forEach((row, index) => {
    rankById.set(row.requestId, index + 1);
  });

  return rankById;
}

export function aggregateRanks(
  rows: PriorityRequestSnapshot[],
  weights: PriorityWeights = PRIORITY_WEIGHTS,
): RankedPriorityRequest[] {
  const gpaRanks = buildRankMap(rows, (row) => row.gpa, 'desc');
  const timeRanks = buildRankMap(rows, (row) => row.createdAt.getTime(), 'asc');
  const attemptsRanks = buildRankMap(
    rows,
    (row) => row.previousRejectedAttempts,
    'desc',
  );

  return [...rows]
    .map((row) => {
      const gpaRank = gpaRanks.get(row.requestId) ?? rows.length;
      const timeRank = timeRanks.get(row.requestId) ?? rows.length;
      const attemptsRank = attemptsRanks.get(row.requestId) ?? rows.length;

      return {
        ...row,
        gpaRank,
        timeRank,
        attemptsRank,
        weightedRank:
          gpaRank * weights.gpa +
          timeRank * weights.time +
          attemptsRank * weights.attempts,
      };
    })
    .sort((a, b) => {
      if (a.weightedRank === b.weightedRank) {
        return a.requestId.localeCompare(b.requestId);
      }

      return a.weightedRank - b.weightedRank;
    });
}

export function calculatePriorityScore(
  activeRequests: PriorityRequestSnapshot[],
  incomingRequest: PriorityRequestSnapshot,
  weights: PriorityWeights = PRIORITY_WEIGHTS,
): number {
  const ranked = aggregateRanks([...activeRequests, incomingRequest], weights);
  const finalRank = ranked.findIndex(
    (entry) => entry.requestId === incomingRequest.requestId,
  );

  if (ranked.length <= 1 || finalRank < 0) {
    return 1;
  }

  return Number(clamp01(1 - finalRank / (ranked.length - 1)).toFixed(6));
}
