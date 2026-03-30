import type { Division } from '../../types';
import type { Severity } from '../incidents/types';

// ── Status ─────────────────────────────────────────────────────────────────

export type InvestigationStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Complete'
  | 'Approved'
  | 'Returned';

// ── Contributing factors ───────────────────────────────────────────────────

export type FactorCategory =
  | 'People'
  | 'Equipment'
  | 'Environmental'
  | 'Procedural'
  | 'Management';

export interface FactorType {
  id: string;
  category: FactorCategory;
  name: string;
}

export interface ContributingFactor {
  factorId: string;
  factorName: string;
  category: FactorCategory;
  isPrimary: boolean;
  notes: string;
}

// ── 5-Why ─────────────────────────────────────────────────────────────────

export interface FiveWhyStep {
  id: string;
  why: string;
  answer: string;
  evidence: string;
}

// ── Witness statements ────────────────────────────────────────────────────

export interface WitnessStatement {
  id: string;
  witnessName: string;
  jobTitle: string;
  employer: string;
  phone: string;
  statementText: string;
  collectionDate: string;
  collectedBy: string;
  submittedAt: string;
}

// ── Assignment ────────────────────────────────────────────────────────────

export interface InvestigationAssignment {
  leadInvestigator: string;
  leadInvestigatorId: string;
  teamMembers: string[];
  targetDate: string;
  assignedBy: string;
  assignedAt: string;
}

// ── Review cycle ──────────────────────────────────────────────────────────

export interface InvestigationReview {
  id: string;
  action: 'Approved' | 'Returned';
  reviewedBy: string;
  reviewedAt: string;
  comments: string;
}

// ── Full investigation entity ─────────────────────────────────────────────

export interface Investigation {
  id: string;
  incidentId: string;
  incidentNumber: string;
  severity?: Severity;
  division?: Division | '';
  project?: string;
  status: InvestigationStatus;
  assignment: InvestigationAssignment | null;
  fiveWhys: FiveWhyStep[];
  rootCauseSummary: string;
  contributingFactors: ContributingFactor[];
  witnessStatements: WitnessStatement[];
  reviews: InvestigationReview[];
  createdAt: string;
}

// ── Static factor type library (admin-configurable in Phase 6) ─────────────

export const FACTOR_LIBRARY: { category: FactorCategory; factors: FactorType[] }[] = [
  {
    category: 'People',
    factors: [
      { id: 'p1', category: 'People', name: 'Training deficiency' },
      { id: 'p2', category: 'People', name: 'Fatigue' },
      { id: 'p3', category: 'People', name: 'Complacency' },
      { id: 'p4', category: 'People', name: 'Communication failure' },
      { id: 'p5', category: 'People', name: 'Inexperience' },
      { id: 'p6', category: 'People', name: 'Impairment' },
      { id: 'p7', category: 'People', name: 'PPE non-compliance' },
    ],
  },
  {
    category: 'Equipment',
    factors: [
      { id: 'e1', category: 'Equipment', name: 'Malfunction' },
      { id: 'e2', category: 'Equipment', name: 'Poor maintenance' },
      { id: 'e3', category: 'Equipment', name: 'Improper use' },
      { id: 'e4', category: 'Equipment', name: 'Design deficiency' },
      { id: 'e5', category: 'Equipment', name: 'Missing guards/safeguards' },
    ],
  },
  {
    category: 'Environmental',
    factors: [
      { id: 'n1', category: 'Environmental', name: 'Weather' },
      { id: 'n2', category: 'Environmental', name: 'Lighting' },
      { id: 'n3', category: 'Environmental', name: 'Noise' },
      { id: 'n4', category: 'Environmental', name: 'Temperature' },
      { id: 'n5', category: 'Environmental', name: 'Terrain' },
      { id: 'n6', category: 'Environmental', name: 'Housekeeping' },
    ],
  },
  {
    category: 'Procedural',
    factors: [
      { id: 'r1', category: 'Procedural', name: 'No procedure exists' },
      { id: 'r2', category: 'Procedural', name: 'Procedure not followed' },
      { id: 'r3', category: 'Procedural', name: 'Procedure inadequate' },
      { id: 'r4', category: 'Procedural', name: 'Permit/clearance failure' },
    ],
  },
  {
    category: 'Management',
    factors: [
      { id: 'm1', category: 'Management', name: 'Inadequate supervision' },
      { id: 'm2', category: 'Management', name: 'Scheduling pressure' },
      { id: 'm3', category: 'Management', name: 'Resource shortage' },
      { id: 'm4', category: 'Management', name: 'Culture/norm' },
      { id: 'm5', category: 'Management', name: 'Change management failure' },
    ],
  },
];

// ── Seed data ─────────────────────────────────────────────────────────────
// Linked to INCIDENT_SEED IDs 1–5

export const INVESTIGATION_SEED: Investigation[] = [
  {
    id: 'inv-1',
    incidentId: '1',
    incidentNumber: 'INC-2026-001',
    severity: 'Medical Treatment',
    division: 'HCC',
    project: 'Mainline Tie Replacement — Segment 4',
    status: 'Returned',
    assignment: {
      leadInvestigator: 'Maria Santos',
      leadInvestigatorId: 'user-santos',
      teamMembers: ['D. Kim', 'R. Okafor'],
      targetDate: '2026-03-20T17:00:00',
      assignedBy: 'T. Griffith (Safety Manager)',
      assignedAt: '2026-03-10T11:00:00',
    },
    fiveWhys: [
      { id: 'fw-1a', why: 'Why did the employee sustain a laceration?', answer: 'Hand came into contact with a sharp rail anchor edge during installation.', evidence: 'Incident photos on file; medical report confirms laceration depth.' },
      { id: 'fw-1b', why: 'Why did the hand contact the rail anchor edge?', answer: 'Employee was not wearing cut-resistant gloves at the time of the task.', evidence: 'Witness confirmed no gloves observed; PPE inspection log reviewed.' },
      { id: 'fw-1c', why: 'Why were cut-resistant gloves not being worn?', answer: 'The current PPE matrix for rail anchor tasks does not require cut-resistant gloves — only standard leather work gloves.', evidence: 'PPE matrix Rev 4, dated Jan 2026, reviewed.' },
    ],
    rootCauseSummary: 'Inadequate PPE requirements in the task-specific PPE matrix failed to specify cut-resistant gloves for rail anchor handling, exposing workers to laceration risk.',
    contributingFactors: [
      { factorId: 'r3', factorName: 'Procedure inadequate', category: 'Procedural', isPrimary: true, notes: 'PPE matrix does not reflect actual cut hazard level for this task.' },
      { factorId: 'p7', factorName: 'PPE non-compliance', category: 'People', isPrimary: false, notes: 'Secondary factor — employee had awareness of general PPE requirements.' },
    ],
    witnessStatements: [
      {
        id: 'ws-1a',
        witnessName: 'D. Kim',
        jobTitle: 'Track Foreman',
        employer: 'Herzog Construction Corp',
        phone: '(317) 555-0142',
        statementText: 'I was working approximately 15 feet from J. Morales when the incident occurred. I observed him picking up a rail anchor without gloves. I did not verbally remind him at that moment. The injury happened quickly.',
        collectionDate: '2026-03-10',
        collectedBy: 'Maria Santos',
        submittedAt: '2026-03-11T09:30:00',
      },
    ],
    reviews: [
      {
        id: 'rev-1a',
        action: 'Returned',
        reviewedBy: 'T. Griffith',
        reviewedAt: '2026-03-22T14:00:00',
        comments: 'The 5-Why analysis is well-reasoned but the contributing factor analysis needs to address the supervision gap. Please add at least one factor from the Management category and expand the witness statement section — we should have a statement from the crew lead.',
      },
    ],
    createdAt: '2026-03-10T11:00:00',
  },
  {
    id: 'inv-2',
    incidentId: '2',
    incidentNumber: 'INC-2026-002',
    severity: 'Near Miss',
    division: 'HRSI',
    project: 'Switch Replacement — Kansas City Yard',
    status: 'In Progress',
    assignment: {
      leadInvestigator: 'C. Nguyen',
      leadInvestigatorId: 'user-nguyen',
      teamMembers: ['B. Torres'],
      targetDate: '2026-03-28T17:00:00',
      assignedBy: 'T. Griffith (Safety Manager)',
      assignedAt: '2026-03-14T16:00:00',
    },
    fiveWhys: [
      { id: 'fw-2a', why: 'Why did the hi-rail and geometry car approach the same block?', answer: 'The hi-rail operator did not receive updated track authority before entering the block.', evidence: '' },
      { id: 'fw-2b', why: 'Why was updated authority not received?', answer: 'Radio communication with the dispatcher was unclear due to noise in the yard environment.', evidence: '' },
      { id: 'fw-2c', why: 'Why was radio communication unclear?', answer: 'The portable radio used by the hi-rail operator had a failing battery, reducing transmission quality.', evidence: '' },
    ],
    rootCauseSummary: '',
    contributingFactors: [
      { factorId: 'e2', factorName: 'Poor maintenance', category: 'Equipment', isPrimary: true, notes: 'Radio equipment was overdue for battery replacement per maintenance schedule.' },
    ],
    witnessStatements: [],
    reviews: [],
    createdAt: '2026-03-14T16:00:00',
  },
  {
    id: 'inv-3',
    incidentId: '5',
    incidentNumber: 'INC-2026-005',
    severity: 'Lost Time',
    division: 'HCC',
    project: 'Bridge Deck Replacement — MP 88',
    status: 'Approved',
    assignment: {
      leadInvestigator: 'A. Osei',
      leadInvestigatorId: 'user-osei',
      teamMembers: ['L. Reyes', 'P. Nakamura', 'G. Walsh'],
      targetDate: '2026-03-30T17:00:00',
      assignedBy: 'T. Griffith (Safety Manager)',
      assignedAt: '2026-03-25T18:00:00',
    },
    fiveWhys: [
      { id: 'fw-3a', why: 'Why did the worker fall from the bridge deck form?', answer: 'The worker lost footing on the wet deck form surface while moving laterally.', evidence: 'Weather report confirms light rain at the time; photos show no anti-slip strips on the form edge.' },
      { id: 'fw-3b', why: 'Why did the worker lose footing on the wet surface?', answer: 'The deck form edge lacked non-slip surfacing and there was no secondary fall protection for the task.', evidence: 'Engineering inspection report; OSHA 1926.502 requires fall protection at 6 ft, confirmed at 4 ft internal standard.' },
      { id: 'fw-3c', why: 'Why was secondary fall protection not in place?', answer: 'The Job Hazard Analysis (JHA) for deck form work did not identify the edge-proximity task as requiring harness use at this height.', evidence: 'JHA Rev 2 reviewed — task description does not include edge proximity work.' },
      { id: 'fw-3d', why: 'Why did the JHA miss this requirement?', answer: 'The JHA was written by a foreman unfamiliar with the specific deck form configuration used on this project, and was not reviewed by Safety before work began.', evidence: 'JHA sign-off sheet reviewed — no Safety Coordinator signature present.' },
    ],
    rootCauseSummary: 'An inadequate Job Hazard Analysis that failed to identify fall protection requirements for edge-proximity tasks on the non-standard deck form configuration, compounded by lack of Safety review before work began.',
    contributingFactors: [
      { factorId: 'r3', factorName: 'Procedure inadequate', category: 'Procedural', isPrimary: true, notes: 'JHA did not address fall protection for edge-proximity work on this deck form type.' },
      { factorId: 'm1', factorName: 'Inadequate supervision', category: 'Management', isPrimary: false, notes: 'Safety Coordinator review of JHA was not completed before work began.' },
      { factorId: 'n1', factorName: 'Weather', category: 'Environmental', isPrimary: false, notes: 'Light rain increased slip risk; no weather-specific precautions were taken.' },
    ],
    witnessStatements: [
      {
        id: 'ws-3a',
        witnessName: 'L. Reyes',
        jobTitle: 'Ironworker',
        employer: 'Herzog Construction Corp',
        phone: '(312) 555-0188',
        statementText: 'I was on the deck form approximately 8 feet from S. Patel. I saw him step sideways to hand tools to another worker and his foot slipped off the edge. There was no lifeline or harness in use for any of us at that point. The rain had started about 20 minutes before.',
        collectionDate: '2026-03-25',
        collectedBy: 'A. Osei',
        submittedAt: '2026-03-26T10:00:00',
      },
      {
        id: 'ws-3b',
        witnessName: 'G. Walsh',
        jobTitle: 'General Foreman',
        employer: 'Herzog Construction Corp',
        phone: '(312) 555-0201',
        statementText: 'I was the foreman on site. I wrote the JHA for this task. I was not aware that the non-standard form required different fall protection. I have since reviewed OSHA 1926.502 with the safety team.',
        collectionDate: '2026-03-26',
        collectedBy: 'A. Osei',
        submittedAt: '2026-03-26T13:30:00',
      },
    ],
    reviews: [
      {
        id: 'rev-3a',
        action: 'Approved',
        reviewedBy: 'T. Griffith',
        reviewedAt: '2026-03-27T09:00:00',
        comments: 'Thorough investigation. Root cause and contributing factors are well-supported. Approved — please proceed with CAPA creation.',
      },
    ],
    createdAt: '2026-03-25T18:00:00',
  },
];
