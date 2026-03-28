import type { Role, Division } from '../../types';
import type { IncidentType } from '../incidents/types';

// ── Railroad ──────────────────────────────────────────────────────────────

export interface Railroad {
  id: string;
  name: string;
  shortCode: string;
  /** Notification deadline in hours per incident type */
  rules: Partial<Record<IncidentType, number>>;
}

export const RAILROAD_SEED: Railroad[] = [
  {
    id: 'rr-1',
    name: 'BNSF Railway',
    shortCode: 'BNSF',
    rules: {
      Injury:          2,
      'Near Miss':     24,
      'Property Damage': 4,
      Environmental:   8,
      Vehicle:         4,
      Fire:            2,
      'Utility Strike': 2,
    },
  },
  {
    id: 'rr-2',
    name: 'Union Pacific Railroad',
    shortCode: 'UP',
    rules: {
      Injury:          1,
      'Near Miss':     24,
      'Property Damage': 4,
      Environmental:   8,
      Vehicle:         4,
      Fire:            2,
      'Utility Strike': 2,
    },
  },
  {
    id: 'rr-3',
    name: 'CSX Transportation',
    shortCode: 'CSX',
    rules: {
      Injury:          2,
      'Near Miss':     48,
      'Property Damage': 8,
      Environmental:   24,
      Vehicle:         8,
      Fire:            4,
      'Utility Strike': 4,
    },
  },
  {
    id: 'rr-4',
    name: 'Norfolk Southern Railway',
    shortCode: 'NS',
    rules: {
      Injury:          2,
      'Near Miss':     24,
      'Property Damage': 4,
      Environmental:   8,
      Vehicle:         4,
      Fire:            2,
      'Utility Strike': 2,
    },
  },
];

// ── Factor Types ──────────────────────────────────────────────────────────

export interface FactorType {
  id: string;
  category: string;
  label: string;
  active: boolean;
}

export const FACTOR_SEED: FactorType[] = [
  // Human Factors
  { id: 'f-1',  category: 'Human Factors',    label: 'Inattention / Distraction',       active: true  },
  { id: 'f-2',  category: 'Human Factors',    label: 'Failure to Follow Procedure',     active: true  },
  { id: 'f-3',  category: 'Human Factors',    label: 'Fatigue',                         active: true  },
  { id: 'f-4',  category: 'Human Factors',    label: 'Inexperience / Lack of Training', active: true  },
  { id: 'f-5',  category: 'Human Factors',    label: 'Communication Failure',           active: true  },
  { id: 'f-6',  category: 'Human Factors',    label: 'Physical Condition',              active: false },
  // Equipment & Tools
  { id: 'f-7',  category: 'Equipment & Tools', label: 'Equipment Malfunction',          active: true  },
  { id: 'f-8',  category: 'Equipment & Tools', label: 'Improper Tool Use',              active: true  },
  { id: 'f-9',  category: 'Equipment & Tools', label: 'Lack of Maintenance',            active: true  },
  { id: 'f-10', category: 'Equipment & Tools', label: 'Design Defect',                  active: true  },
  // Environment
  { id: 'f-11', category: 'Environment',       label: 'Weather Conditions',             active: true  },
  { id: 'f-12', category: 'Environment',       label: 'Poor Lighting',                  active: true  },
  { id: 'f-13', category: 'Environment',       label: 'Noise / Vibration',              active: true  },
  { id: 'f-14', category: 'Environment',       label: 'Housekeeping Issues',            active: false },
  // Management / Organizational
  { id: 'f-15', category: 'Management',        label: 'Inadequate Planning',            active: true  },
  { id: 'f-16', category: 'Management',        label: 'Insufficient Supervision',       active: true  },
  { id: 'f-17', category: 'Management',        label: 'Policy / Procedure Gap',         active: true  },
  { id: 'f-18', category: 'Management',        label: 'Resource Constraints',           active: true  },
  // External
  { id: 'f-19', category: 'External',          label: 'Third-Party Action',             active: true  },
  { id: 'f-20', category: 'External',          label: 'Regulatory Requirement Change',  active: true  },
];

// ── Shift Windows ─────────────────────────────────────────────────────────

export interface ShiftWindow {
  id: string;
  name: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export const SHIFT_SEED: ShiftWindow[] = [
  { id: 'sw-1', name: 'Day Shift',   start: '06:00', end: '14:00' },
  { id: 'sw-2', name: 'Swing Shift', start: '14:00', end: '22:00' },
  { id: 'sw-3', name: 'Night Shift', start: '22:00', end: '06:00' },
];

// ── Geofence Zones ────────────────────────────────────────────────────────

export interface GeofenceZone {
  id: string;
  name: string;
  railroad: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export const GEOFENCE_SEED: GeofenceZone[] = [
  { id: 'gf-1', name: 'Kansas City Yard',  railroad: 'BNSF', lat: 39.0997, lng: -94.5786, radiusMeters: 500 },
  { id: 'gf-2', name: 'Northtown Yard',    railroad: 'BNSF', lat: 45.0209, lng: -93.2716, radiusMeters: 750 },
  { id: 'gf-3', name: 'North Platte Yard', railroad: 'UP',   lat: 41.1239, lng: -100.7654, radiusMeters: 1000 },
  { id: 'gf-4', name: 'Memphis Junction',  railroad: 'CSX',  lat: 35.1495, lng: -90.0490, radiusMeters: 600 },
];

// ── Managed Users ─────────────────────────────────────────────────────────

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  division: Division | null;
  active: boolean;
}

export const MANAGED_USER_SEED: ManagedUser[] = [
  { id: 'u-1', name: 'Tyler Griffith',   email: 'tgriffith@herzog.com',   role: 'safety_manager',     division: null,           active: true  },
  { id: 'u-2', name: 'Sarah Chen',       email: 'schen@herzog.com',       role: 'safety_coordinator', division: 'HCC',          active: true  },
  { id: 'u-3', name: 'Marcus Williams',  email: 'mwilliams@herzog.com',   role: 'field_reporter',     division: 'HRSI',         active: true  },
  { id: 'u-4', name: 'Jennifer Park',    email: 'jpark@herzog.com',       role: 'division_manager',   division: 'HSI',          active: true  },
  { id: 'u-5', name: 'David Rodriguez',  email: 'drodriguez@herzog.com',  role: 'project_manager',    division: 'HTI',          active: true  },
  { id: 'u-6', name: 'Amanda Foster',    email: 'afoster@herzog.com',     role: 'executive',          division: null,           active: true  },
  { id: 'u-7', name: 'Kevin O\'Brien',   email: 'kobrien@herzog.com',     role: 'field_reporter',     division: 'Herzog Energy', active: false },
];

// ── Audit Log ─────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'return' | 'verify' | 'generate';
  entityType: string;
  entityId: string;
  entityLabel: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  justification?: string;
}

export const AUDIT_LOG_SEED: AuditLogEntry[] = [
  { id: 'al-1',  timestamp: '2026-03-27T14:10:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'approve',   entityType: 'Investigation', entityId: 'inv-3', entityLabel: 'INC-2026-003 Investigation' },
  { id: 'al-2',  timestamp: '2026-03-27T13:55:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'create',    entityType: 'CAPA',          entityId: 'capa-6', entityLabel: 'CAPA-2026-006' },
  { id: 'al-3',  timestamp: '2026-03-27T11:30:00', userId: 'u-3', userName: 'Marcus Williams',  action: 'create',    entityType: 'Incident',      entityId: '5',      entityLabel: 'INC-2026-005' },
  { id: 'al-4',  timestamp: '2026-03-26T16:20:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'return',    entityType: 'Investigation', entityId: 'inv-1',  entityLabel: 'INC-2026-001 Investigation', justification: 'Need deeper 5-Why analysis at levels 3-5' },
  { id: 'al-5',  timestamp: '2026-03-26T14:05:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'update',    entityType: 'CAPA',          entityId: 'capa-2', entityLabel: 'CAPA-2026-002', fieldName: 'status', oldValue: 'Open', newValue: 'In Progress' },
  { id: 'al-6',  timestamp: '2026-03-25T17:45:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'update',    entityType: 'Investigation', entityId: 'inv-2',  entityLabel: 'INC-2026-002 Investigation', fieldName: 'assignedTo', oldValue: 'Marcus Williams', newValue: 'Sarah Chen' },
  { id: 'al-7',  timestamp: '2026-03-25T15:00:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'verify',    entityType: 'CAPA',          entityId: 'capa-1', entityLabel: 'CAPA-2026-001', newValue: 'Ineffective', justification: 'Root cause recurred in INC-2026-004' },
  { id: 'al-8',  timestamp: '2026-03-24T10:30:00', userId: 'u-4', userName: 'Jennifer Park',    action: 'update',    entityType: 'User',          entityId: 'u-7',    entityLabel: 'Kevin O\'Brien', fieldName: 'active', oldValue: 'true', newValue: 'false' },
  { id: 'al-9',  timestamp: '2026-03-23T09:15:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'generate',  entityType: 'Report',        entityId: '3',      entityLabel: 'INC-2026-003 Incident Report' },
  { id: 'al-10', timestamp: '2026-03-22T14:20:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'create',    entityType: 'RecurrenceLink', entityId: 'rl-1',  entityLabel: 'INC-2026-001 ↔ INC-2026-003' },
  { id: 'al-11', timestamp: '2026-03-21T11:00:00', userId: 'u-5', userName: 'David Rodriguez',  action: 'update',    entityType: 'Railroad',      entityId: 'rr-1',   entityLabel: 'BNSF Railway', fieldName: 'rules.Injury', oldValue: '4', newValue: '2', justification: 'Updated per BNSF Contractor Safety Bulletin 2026-03' },
  { id: 'al-12', timestamp: '2026-03-20T16:45:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'approve',   entityType: 'Investigation', entityId: 'inv-3',  entityLabel: 'INC-2026-003 Investigation' },
  { id: 'al-13', timestamp: '2026-03-19T13:30:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'create',    entityType: 'CAPA',          entityId: 'capa-5', entityLabel: 'CAPA-2026-005' },
  { id: 'al-14', timestamp: '2026-03-18T10:00:00', userId: 'u-4', userName: 'Jennifer Park',    action: 'update',    entityType: 'ShiftWindow',   entityId: 'sw-1',   entityLabel: 'Day Shift', fieldName: 'start', oldValue: '07:00', newValue: '06:00' },
  { id: 'al-15', timestamp: '2026-03-17T14:30:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'create',    entityType: 'Geofence',      entityId: 'gf-4',   entityLabel: 'Memphis Junction' },
  { id: 'al-16', timestamp: '2026-03-15T09:45:00', userId: 'u-6', userName: 'Amanda Foster',    action: 'update',    entityType: 'User',          entityId: 'u-2',    entityLabel: 'Sarah Chen', fieldName: 'division', oldValue: 'HRSI', newValue: 'HCC' },
  { id: 'al-17', timestamp: '2026-03-14T11:20:00', userId: 'u-2', userName: 'Sarah Chen',       action: 'create',    entityType: 'Incident',      entityId: '4',      entityLabel: 'INC-2026-004' },
  { id: 'al-18', timestamp: '2026-03-13T08:30:00', userId: 'u-1', userName: 'Tyler Griffith',   action: 'update',    entityType: 'FactorType',    entityId: 'f-6',    entityLabel: 'Physical Condition', fieldName: 'active', oldValue: 'true', newValue: 'false' },
  { id: 'al-19', timestamp: '2026-03-10T14:15:00', userId: 'u-3', userName: 'Marcus Williams',  action: 'create',    entityType: 'Incident',      entityId: '2',      entityLabel: 'INC-2026-002' },
  { id: 'al-20', timestamp: '2026-03-05T10:00:00', userId: 'u-4', userName: 'Jennifer Park',    action: 'create',    entityType: 'Railroad',      entityId: 'rr-4',   entityLabel: 'Norfolk Southern Railway' },
];
