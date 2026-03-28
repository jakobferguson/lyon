// ── Enums ─────────────────────────────────────────────────────────────────

export type CapaStatus =
  | 'Open'
  | 'In Progress'
  | 'Completed'
  | 'Verification Pending'
  | 'Verified Effective'
  | 'Verified Ineffective';

export type CapaType = 'Corrective' | 'Preventive';

export type CapaCategory =
  | 'Training'
  | 'Procedure Change'
  | 'Engineering Control'
  | 'PPE'
  | 'Equipment Modification'
  | 'Policy Change'
  | 'Other';

export type CapaPriority = 'Critical' | 'High' | 'Medium' | 'Low';

// ── Entity ────────────────────────────────────────────────────────────────

export interface Capa {
  id: string;
  capaNumber: string;
  type: CapaType;
  category: CapaCategory;
  description: string;
  assignedTo: string;
  assignedToId: string;
  priority: CapaPriority;
  dueDate: string;
  verificationDueDate: string;
  verificationMethod: string;
  linkedIncidentIds: string[];
  linkedInvestigationId: string | null;
  status: CapaStatus;
  completionNotes: string;
  completedAt: string | null;
  verifiedBy: string | null;
  verifiedById: string | null;
  verifiedAt: string | null;
  verificationNotes: string;
  createdAt: string;
  createdBy: string;
}

// ── Form shape ────────────────────────────────────────────────────────────

export interface CapaFormValues {
  type: CapaType | '';
  category: CapaCategory | '';
  description: string;
  assignedTo: string;
  priority: CapaPriority | '';
  dueDate: string;
  verificationDueDate: string;
  verificationMethod: string;
  linkedIncidentIds: string[];
  linkedInvestigationId: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────

export const CAPA_SEED: Capa[] = [
  {
    id: 'capa-1',
    capaNumber: 'CAPA-2026-001',
    type: 'Corrective',
    category: 'PPE',
    description: 'Update the task-specific PPE matrix for rail anchor handling to require cut-resistant gloves (ANSI A4 or higher). Distribute updated matrix to all HCC crews and conduct toolbox talk confirming receipt.',
    assignedTo: 'Maria Santos',
    assignedToId: 'user-santos',
    priority: 'High',
    dueDate: '2026-04-10T17:00:00',
    verificationDueDate: '2026-06-10T17:00:00',
    verificationMethod: 'Field verification audit — observe crew performing rail anchor task with updated PPE matrix in place. Confirm cut-resistant gloves are worn and matrix is posted at staging area.',
    linkedIncidentIds: ['1'],
    linkedInvestigationId: 'inv-1',
    status: 'In Progress',
    completionNotes: '',
    completedAt: null,
    verifiedBy: null,
    verifiedById: null,
    verifiedAt: null,
    verificationNotes: '',
    createdAt: '2026-03-22T10:00:00',
    createdBy: 'T. Griffith',
  },
  {
    id: 'capa-2',
    capaNumber: 'CAPA-2026-002',
    type: 'Corrective',
    category: 'Procedure Change',
    description: 'Revise the Job Hazard Analysis template to include a mandatory section for edge-proximity fall protection requirements. Require Safety Coordinator sign-off on all JHAs before work begins on elevated structures.',
    assignedTo: 'A. Osei',
    assignedToId: 'user-osei',
    priority: 'Critical',
    dueDate: '2026-04-01T17:00:00',
    verificationDueDate: '2026-05-01T17:00:00',
    verificationMethod: 'Review 5 completed JHAs for bridge/elevated work to confirm new template and Safety Coordinator signatures are present.',
    linkedIncidentIds: ['5'],
    linkedInvestigationId: 'inv-3',
    status: 'Verified Effective',
    completionNotes: 'Revised JHA template deployed March 28. Mandatory Safety Coordinator review checklist added. Toolbox talk conducted with all bridge crews. New template added to intranet and project kickoff checklist.',
    completedAt: '2026-03-28T16:00:00',
    verifiedBy: 'T. Griffith',
    verifiedById: 'user-griffith',
    verifiedAt: '2026-04-15T11:00:00',
    verificationNotes: 'Reviewed 6 JHAs completed after the effective date. All include fall protection section and Safety Coordinator signatures. Confirmed with field supervisors that process is being followed.',
    createdAt: '2026-03-27T09:30:00',
    createdBy: 'T. Griffith',
  },
  {
    id: 'capa-3',
    capaNumber: 'CAPA-2026-003',
    type: 'Corrective',
    category: 'Engineering Control',
    description: 'Install non-slip abrasive strips along all bridge deck form edges. Procure and install temporary guardrails at form edges exceeding 4 feet above lower work surface.',
    assignedTo: 'G. Walsh',
    assignedToId: 'user-walsh',
    priority: 'Critical',
    dueDate: '2026-03-30T17:00:00',
    verificationDueDate: '2026-04-30T17:00:00',
    verificationMethod: 'Site inspection to confirm abrasive strips and guardrails installed at all active elevated work surfaces.',
    linkedIncidentIds: ['5'],
    linkedInvestigationId: 'inv-3',
    status: 'Verification Pending',
    completionNotes: 'Abrasive strips installed on all deck form edges at MP 88 bridge. Temporary guardrails erected on east and west form edges. Materials procured for remaining active bridge sites.',
    completedAt: '2026-03-29T14:00:00',
    verifiedBy: null,
    verifiedById: null,
    verifiedAt: null,
    verificationNotes: '',
    createdAt: '2026-03-27T09:45:00',
    createdBy: 'T. Griffith',
  },
  {
    id: 'capa-4',
    capaNumber: 'CAPA-2026-004',
    type: 'Preventive',
    category: 'Training',
    description: 'Conduct company-wide radio equipment maintenance training. Implement a pre-shift radio function check as a standing item on the daily briefing checklist for all hi-rail and track geometry crews.',
    assignedTo: 'C. Nguyen',
    assignedToId: 'user-nguyen',
    priority: 'Medium',
    dueDate: '2026-04-28T17:00:00',
    verificationDueDate: '2026-07-28T17:00:00',
    verificationMethod: 'Audit 3 daily briefing checklists per week for 4 weeks to confirm radio check item is being completed. Verify training attendance records.',
    linkedIncidentIds: ['2'],
    linkedInvestigationId: 'inv-2',
    status: 'Open',
    completionNotes: '',
    completedAt: null,
    verifiedBy: null,
    verifiedById: null,
    verifiedAt: null,
    verificationNotes: '',
    createdAt: '2026-03-27T14:00:00',
    createdBy: 'T. Griffith',
  },
  {
    id: 'capa-5',
    capaNumber: 'CAPA-2026-005',
    type: 'Corrective',
    category: 'Equipment Modification',
    description: 'Replace all portable radios assigned to hi-rail operators with new units featuring battery health indicators. Establish a quarterly battery replacement schedule regardless of apparent charge level.',
    assignedTo: 'C. Nguyen',
    assignedToId: 'user-nguyen',
    priority: 'High',
    dueDate: '2026-04-14T17:00:00',
    verificationDueDate: '2026-06-14T17:00:00',
    verificationMethod: 'Physical inventory of hi-rail radio fleet. Confirm all units are new models with battery indicators. Review maintenance schedule documentation.',
    linkedIncidentIds: ['2'],
    linkedInvestigationId: 'inv-2',
    status: 'Open',
    completionNotes: '',
    completedAt: null,
    verifiedBy: null,
    verifiedById: null,
    verifiedAt: null,
    verificationNotes: '',
    createdAt: '2026-03-27T14:15:00',
    createdBy: 'T. Griffith',
  },
];
