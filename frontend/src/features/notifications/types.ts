// ── Notification event types ──────────────────────────────────────────────

export type NotificationEventType =
  | 'incident_reported'
  | 'investigation_assigned'
  | 'investigation_overdue'
  | 'investigation_approved'
  | 'investigation_returned'
  | 'capa_assigned'
  | 'capa_overdue'
  | 'capa_ineffective'
  | 'railroad_overdue'
  | 'report_generated';

// ── Event icons ───────────────────────────────────────────────────────────

export const EVENT_ICONS: Record<NotificationEventType, string> = {
  incident_reported:       '📋',
  investigation_assigned:  '🔍',
  investigation_overdue:   '⚠',
  investigation_approved:  '✅',
  investigation_returned:  '↩',
  capa_assigned:           '📌',
  capa_overdue:            '🕐',
  capa_ineffective:        '❌',
  railroad_overdue:        '🚂',
  report_generated:        '📄',
};

// ── Entity ────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  eventType: NotificationEventType;
  title: string;
  summary: string;
  linkTo: string;
  createdAt: string;
  read: boolean;
  tier?: 1 | 2 | 3; // escalation tier — 3 triggers persistent banner
}

// ── Seed data ─────────────────────────────────────────────────────────────

export const NOTIFICATION_SEED: AppNotification[] = [
  {
    id: 'notif-1',
    eventType: 'investigation_overdue',
    title: 'Investigation Overdue — Tier 3',
    summary: 'INC-2026-001 investigation is 15 days overdue. Immediate attention required from Safety Manager, Division Manager, and Executive.',
    linkTo: '/app/investigations/inv-1',
    createdAt: '2026-03-26T08:00:00',
    read: false,
    tier: 3,
  },
  {
    id: 'notif-2',
    eventType: 'incident_reported',
    title: 'New Incident Reported',
    summary: 'INC-2026-005 (Lost Time Injury) reported at Bridge MP 88 by S. Patel. HCC Division.',
    linkTo: '/app/incidents/5',
    createdAt: '2026-03-25T16:30:00',
    read: false,
  },
  {
    id: 'notif-3',
    eventType: 'investigation_overdue',
    title: 'Investigation Overdue — Tier 2',
    summary: 'INC-2026-002 investigation is 8 days overdue. Division Manager has been notified.',
    linkTo: '/app/investigations/inv-2',
    createdAt: '2026-03-24T09:00:00',
    read: false,
    tier: 2,
  },
  {
    id: 'notif-4',
    eventType: 'capa_assigned',
    title: 'CAPA Assigned to You',
    summary: 'CAPA-2026-004 (Radio Equipment Training) has been assigned to you with a due date of April 28.',
    linkTo: '/app/capas/capa-4',
    createdAt: '2026-03-27T14:15:00',
    read: false,
  },
  {
    id: 'notif-5',
    eventType: 'capa_overdue',
    title: 'CAPA Overdue',
    summary: 'CAPA-2026-002 (JHA Template Revision) was due March 30. Please complete or escalate.',
    linkTo: '/app/capas/capa-2',
    createdAt: '2026-03-31T07:00:00',
    read: true,
  },
  {
    id: 'notif-6',
    eventType: 'investigation_assigned',
    title: 'Investigation Assigned',
    summary: 'You have been assigned as Lead Investigator for INC-2026-005 (Bridge Deck Fall). Target date: March 30.',
    linkTo: '/app/investigations/inv-3',
    createdAt: '2026-03-25T17:00:00',
    read: true,
  },
  {
    id: 'notif-7',
    eventType: 'investigation_returned',
    title: 'Investigation Returned for Revision',
    summary: 'INC-2026-001 investigation was returned by T. Griffith. Additional 5-Why depth required at levels 3–5.',
    linkTo: '/app/investigations/inv-1',
    createdAt: '2026-03-20T11:30:00',
    read: true,
  },
  {
    id: 'notif-8',
    eventType: 'investigation_approved',
    title: 'Investigation Approved',
    summary: 'INC-2026-003 investigation has been approved by T. Griffith. CAPAs are being created.',
    linkTo: '/app/investigations/inv-3',
    createdAt: '2026-03-18T14:00:00',
    read: true,
  },
  {
    id: 'notif-9',
    eventType: 'capa_ineffective',
    title: 'CAPA Verified Ineffective',
    summary: 'CAPA-2026-001 was verified ineffective. Review the investigation to determine next steps.',
    linkTo: '/app/capas/capa-1',
    createdAt: '2026-03-15T10:00:00',
    read: true,
  },
  {
    id: 'notif-10',
    eventType: 'railroad_overdue',
    title: 'Railroad Notification Overdue',
    summary: 'BNSF notification for INC-2026-005 is 2 hours past the required deadline. Notify immediately.',
    linkTo: '/app/incidents/5',
    createdAt: '2026-03-25T18:45:00',
    read: true,
  },
];
