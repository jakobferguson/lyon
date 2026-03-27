// ── Types ─────────────────────────────────────────────────────────────────

export type SimilarityType =
  | 'Same Location'
  | 'Same Type'
  | 'Same Root Cause'
  | 'Same Equipment'
  | 'Same Person';

export const SIMILARITY_TYPES: SimilarityType[] = [
  'Same Location',
  'Same Type',
  'Same Root Cause',
  'Same Equipment',
  'Same Person',
];

export interface RecurrenceLink {
  id: string;
  incidentAId: string;
  incidentBId: string;
  similarityTypes: SimilarityType[];
  notes: string;
  linkedBy: string;
  linkedAt: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────

export const RECURRENCE_SEED: RecurrenceLink[] = [
  {
    id: 'rec-1',
    incidentAId: '1',
    incidentBId: '5',
    similarityTypes: ['Same Type', 'Same Root Cause'],
    notes: 'Both incidents involve manual handling tasks on HCC crews without adequate task-specific PPE guidance. Root cause in both investigations identified as gap in task-specific PPE matrix.',
    linkedBy: 'T. Griffith',
    linkedAt: '2026-03-26T09:00:00',
  },
  {
    id: 'rec-2',
    incidentAId: '1',
    incidentBId: '3',
    similarityTypes: ['Same Location'],
    notes: 'Both incidents occurred in the HCC division on construction sites. Suggests systemic gap in hazard recognition for that division.',
    linkedBy: 'T. Griffith',
    linkedAt: '2026-03-26T09:15:00',
  },
];
