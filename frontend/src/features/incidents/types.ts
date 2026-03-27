import type { Division } from '../../types';

export type IncidentType =
  | 'Injury'
  | 'Near Miss'
  | 'Property Damage'
  | 'Environmental'
  | 'Vehicle'
  | 'Fire'
  | 'Utility Strike';

export type Severity =
  | 'Fatality'
  | 'Lost Time'
  | 'Medical Treatment'
  | 'First Aid'
  | 'Near Miss';

export type ShiftType = 'Day' | 'Night' | 'Swing';

export type WeatherCondition =
  | 'Clear'
  | 'Rain'
  | 'Snow'
  | 'Ice'
  | 'Fog'
  | 'Wind'
  | 'Extreme Heat'
  | 'Extreme Cold';

export type IncidentStatus =
  | 'Draft'
  | 'Reported'
  | 'Under Investigation'
  | 'Investigation Complete'
  | 'Investigation Approved'
  | 'CAPA Assigned'
  | 'CAPA In Progress'
  | 'Closed'
  | 'Reopened';

export type NotificationMethod = 'Phone' | 'Email' | 'In-Person' | 'Radio' | 'Other';

export type InjuryType =
  | 'Laceration'
  | 'Fracture'
  | 'Sprain/Strain'
  | 'Burn'
  | 'Contusion'
  | 'Amputation'
  | 'Concussion'
  | 'Illness'
  | 'Other';

export type BodyPart =
  | 'Head' | 'Eye' | 'Neck' | 'Shoulder' | 'Arm' | 'Elbow' | 'Wrist'
  | 'Hand' | 'Finger' | 'Chest' | 'Back' | 'Hip' | 'Leg' | 'Knee'
  | 'Ankle' | 'Foot' | 'Toe' | 'Multiple';

export type BodySide = 'Left' | 'Right' | 'Bilateral' | 'N/A';

export type TreatmentType =
  | 'No Treatment'
  | 'First Aid On-Site'
  | 'Clinic/Urgent Care'
  | 'Emergency Room'
  | 'Hospitalization';

export type ReturnToWorkStatus =
  | 'Full Duty'
  | 'Restricted Duty'
  | 'Off Work'
  | 'Not Yet Determined';

// ── Sub-form shapes ────────────────────────────────────────────────────────

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  textDescription: string;
  gpsSource: 'gps' | 'manual';
}

export interface RailroadNotification {
  wasNotified: boolean | null;
  notificationDateTime: string;
  method: NotificationMethod | '';
  personNotified: string;
  personTitle: string;
  notes: string;
}

export interface InjuredPersonData {
  name: string;              // HIPAA
  jobTitle: string;
  division: Division | '';
  injuryType: InjuryType | '';
  bodyPart: BodyPart | '';
  bodySide: BodySide | '';
  treatmentType: TreatmentType | '';   // HIPAA
  returnToWork: ReturnToWorkStatus | ''; // HIPAA
  daysAway: number | '';              // HIPAA
  daysRestricted: number | '';        // HIPAA
}

// ── Full incident form shape ───────────────────────────────────────────────

export interface IncidentFormValues {
  // Quick report
  incidentType: IncidentType | '';
  dateTime: string;
  location: LocationData;
  description: string;

  // Full report
  division: Division | '';
  project: string;
  immediateActions: string;
  severity: Severity | '';
  potentialSeverity: Severity | '';
  shift: ShiftType | '';
  shiftStart: string;
  shiftEnd: string;
  weather: WeatherCondition | '';
  onRailroadProperty: boolean;
  railroadClient: string;
  railroadNotification: RailroadNotification;
  injuredPersons: InjuredPersonData[];

  // OSHA
  isOshaRecordable: boolean | null;
  isDart: boolean | null;
  oshaOverrideJustification: string;

  // Status
  status: IncidentStatus;

  // Photos (File objects, not persisted to form storage)
  photos: File[];
}

// ── List / display entity ──────────────────────────────────────────────────

export interface Incident {
  id: string;
  incidentNumber: string;
  incidentType: IncidentType;
  dateTime: string;
  division: Division | '';
  project: string;
  severity: Severity | '';
  status: IncidentStatus;
  description: string;
  location: LocationData;
  reportedBy: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────

export const INCIDENT_SEED: Incident[] = [
  {
    id: '1',
    incidentNumber: 'INC-2026-001',
    incidentType: 'Injury',
    dateTime: '2026-03-10T08:30:00',
    division: 'HCC',
    project: 'Mainline Tie Replacement — Segment 4',
    severity: 'Medical Treatment',
    status: 'Under Investigation',
    description: 'Employee sustained laceration to left hand while handling rail anchors.',
    location: { latitude: 39.7684, longitude: -86.1581, textDescription: 'MP 142.3 — Indianapolis Sub', gpsSource: 'gps' },
    reportedBy: 'J. Morales',
  },
  {
    id: '2',
    incidentNumber: 'INC-2026-002',
    incidentType: 'Near Miss',
    dateTime: '2026-03-14T14:15:00',
    division: 'HRSI',
    project: 'Switch Replacement — Kansas City Yard',
    severity: 'Near Miss',
    status: 'Reported',
    description: 'Hi-rail vehicle and track geometry car approached same block without proper authority.',
    location: { latitude: 39.0997, longitude: -94.5786, textDescription: 'KC Yard — Track 7', gpsSource: 'gps' },
    reportedBy: 'T. Washington',
  },
  {
    id: '3',
    incidentNumber: 'INC-2026-003',
    incidentType: 'Property Damage',
    dateTime: '2026-03-18T11:00:00',
    division: 'HTI',
    project: 'Light Rail Maintenance — Denver',
    severity: 'First Aid',
    status: 'CAPA Assigned',
    description: 'Forklift clipped signal bungalow corner during material offload.',
    location: { latitude: 39.7392, longitude: -104.9903, textDescription: 'Denver Yard — Offload Bay 2', gpsSource: 'manual' },
    reportedBy: 'R. Chen',
  },
  {
    id: '4',
    incidentNumber: 'INC-2026-004',
    incidentType: 'Vehicle',
    dateTime: '2026-03-20T07:45:00',
    division: 'HSI',
    project: 'Grade Crossing Rehab — IL Route 9',
    severity: 'First Aid',
    status: 'Draft',
    description: 'Company truck backed into guardrail at project staging area.',
    location: { latitude: 40.6936, longitude: -89.5890, textDescription: 'IL Route 9 — Staging Area North', gpsSource: 'manual' },
    reportedBy: 'A. Rodriguez',
  },
  {
    id: '5',
    incidentNumber: 'INC-2026-005',
    incidentType: 'Injury',
    dateTime: '2026-03-25T16:20:00',
    division: 'HCC',
    project: 'Bridge Deck Replacement — MP 88',
    severity: 'Lost Time',
    status: 'Investigation Approved',
    description: 'Worker fell approximately 4 feet from bridge deck form. Ankle fracture confirmed.',
    location: { latitude: 41.8781, longitude: -87.6298, textDescription: 'Bridge MP 88 — Deck Form East', gpsSource: 'gps' },
    reportedBy: 'S. Patel',
  },
];
