# SRD-10: Extended Requirements Document

## 1. Overview

**Project Name:** Lyon (SRD-10 — Incident Investigation & Corrective Action System)
**Type:** Internal web application (Dockerized)
**Purpose:** Centralized hub for railroad incident reporting, investigation workflows (5-Why analysis, contributing factor classification), CAPA management with effectiveness verification, safety dashboards with TRIR/DART metrics, and manual incident recurrence linking.
**Operator:** Herzog — North American rail and heavy/highway infrastructure contractor
**User Base:** ~5,000 users across 7 divisions (HCC, HRSI, HSI, HTI, HTSI, Herzog Energy, Green Group)
**Geographic Scope:** United States, Canada, Mexico (multi-timezone)
**Build Type:** Greenfield

---

## 2. Roles & Permissions (RBAC)

| Role | Create Incident | Manage Investigations | Manage CAPAs | Review/Approve | View Dashboards | Admin Config | Medical Data Access |
|---|---|---|---|---|---|---|---|
| Field Reporter | Yes | No | No | No | Own incidents | No | No |
| Safety Coordinator | Yes | Yes | Yes | No | Division | No | Yes |
| Safety Manager | Yes | Yes | Yes | Yes (approve/reject) | All | Partial (factor types, railroads) | Yes |
| Project Manager | Yes | No | No | No | Own projects | No | No |
| Division Manager | No | No | No | No | Own division | No | No |
| Executive | No | No | No | No | All | No | No |
| Admin | Yes | Yes | Yes | Yes | All | Full | Yes |

### Permission Details
- **Field Reporters** are the bulk of the user base. They submit incident reports and can view/edit their own drafts.
- **Safety Coordinators** manage the day-to-day investigation and CAPA workflow, including manual recurrence linking.
- **Safety Managers** are the approval authority for investigations, configure system settings (factor types, railroad rules, benchmark values), and enter hours-worked data.
- **Project Managers** see incidents tied to their projects/job sites.
- **Division Managers** see aggregated data for their division only.
- **Executives** have read-only access to all dashboards and reports.
- **Admins** have full system configuration access including user management, role assignment, and all admin settings.

---

## 3. Incident Reporting

### 3.1 Incident Form Fields

**Quick Report (minimum required for initial submission):**
| Field | Type | Required | Notes |
|---|---|---|---|
| Incident Type | Select | Yes | Injury, Near Miss, Property Damage, Environmental, Vehicle, Fire, Utility Strike |
| Date/Time | DateTime | Yes | Local time with timezone captured |
| Location | GPS + Text | Yes | Browser Geolocation API auto-fill; manual override always available. GPS component must be modular/swappable. |
| Description | Text (long) | Yes | Free-text narrative |

**Full Report (completable in stages — save as draft):**
| Field | Type | Required | Notes |
|---|---|---|---|
| Division | Select | No (until submit) | Populated from division list |
| Project / Job Site | Select | No (until submit) | Filtered by division |
| Immediate Actions Taken | Text | No | What was done on-scene |
| Severity | Select | No (until submit) | Fatality, Lost Time, Medical Treatment, First Aid, Near Miss |
| Potential Severity | Select | No | What could have happened |
| Shift | Select | No | Day, Night, Swing — with start/end times |
| Weather Conditions | Select | No | Clear, Rain, Snow, Ice, Fog, Wind, Extreme Heat, Extreme Cold |
| Photos | File Upload | No | Up to 15 photos per incident; max 10MB per photo; accepted formats: JPEG, PNG, HEIC |
| On Railroad Property | Checkbox | Auto + Manual | Auto-checked if GPS coordinates fall within a known railroad property geofence; manually overridable |
| Railroad Client | Select | Conditional | Required if on railroad property; populated from configurable railroad list |
| Railroad Notification Status | Sub-form | Conditional | See Section 3.4 |

### 3.2 Completion Indicator
- Visual progress bar showing percentage of fields completed
- Color-coded: Red (<50%), Yellow (50-80%), Green (>80%)
- Draft save allowed at any completion level; full submit requires all "required" fields

### 3.3 OSHA Recordability Determination

Guided decision tree per 29 CFR 1904:

```
Step 1: Was it work-related?
  → No → Not Recordable (end)
  → Yes → Step 2

Step 2: Did the incident result in any of the following?
  [ ] Death
  [ ] Days away from work
  [ ] Restricted work or transfer to another job
  [ ] Medical treatment beyond first aid
  [ ] Loss of consciousness
  [ ] Significant injury/illness diagnosed by physician

  → Any checked → RECORDABLE
    → If "Days away" or "Restricted/Transfer" checked → also DART
  → None checked → Not Recordable
```

**First Aid Treatments (NOT recordable):**
- Non-prescription medications at nonprescription strength
- Wound cleaning, bandaging, butterfly strips/Steri-Strips
- Hot/cold therapy
- Elastic bandages, wraps
- Eye patches, eye flushing
- Tetanus immunizations
- Drinking fluids for heat-related illness

**System behavior:**
- Sets `is_osha_recordable` and `is_dart` flags automatically based on answers
- User may override either flag with **required written justification** (free text)
- All overrides are immutably audit-logged with timestamp, user, original value, new value, and justification

### 3.4 Railroad Client Notification Tracking

**Default notification deadlines (admin-configurable per railroad):**

| Railroad | Injury | Near Miss | Property Damage |
|---|---|---|---|
| BNSF | 2 hours | 24 hours | 4 hours |
| UP | Immediately (15 min) | 24 hours | 2 hours |
| CSX | 1 hour | Within shift | 1 hour |
| NS | 2 hours | 24 hours | 2 hours |

- **"Immediately" is interpreted as 15 minutes** for system alerting purposes
- **"Within shift" deadlines** are calculated using configurable shift window definitions:

**Default Shift Windows (admin-configurable):**
| Shift | Start | End |
|---|---|---|
| Day | 06:00 | 18:00 |
| Night | 18:00 | 06:00 (next day) |
| Swing | 14:00 | 02:00 (next day) |

- Deadline = end of the shift window corresponding to the incident's recorded shift value
- If the incident is reported near the end of a shift, the clock still runs to that shift's end time (not a fixed-hour window from report time)
- Shift windows are stored alongside railroad notification rules in the configuration endpoint
- Railroad list, notification rules, and shift windows are all **admin-configurable** — new railroads can be added with custom deadline rules per incident type
- Notification tracking sub-form:
  - Was client notified? (Yes/No)
  - Notification date/time
  - Notification method (Phone, Email, In-Person, Radio, Other)
  - Person notified (name and title)
  - Notes
- System flags overdue notifications with countdown timer and escalation alerts

### 3.5 Injured Person Details

| Field | Type | Notes |
|---|---|---|
| Name | Text | **HIPAA-protected — field-level encryption** |
| Job Title | Text | |
| Division | Select | |
| Injury Type | Select | Laceration, Fracture, Sprain/Strain, Burn, Contusion, Amputation, Concussion, Illness, Other |
| Body Part | Select | Head, Eye, Neck, Shoulder, Arm, Elbow, Wrist, Hand, Finger, Chest, Back, Hip, Leg, Knee, Ankle, Foot, Toe, Multiple |
| Side | Select | Left, Right, Bilateral, N/A |
| Treatment Type | Select | **HIPAA-protected** — No Treatment, First Aid On-Site, Clinic/Urgent Care, Emergency Room, Hospitalization |
| Return-to-Work Status | Select | **HIPAA-protected** — Full Duty, Restricted Duty, Off Work, Not Yet Determined |
| Days Away | Number | **HIPAA-protected** — tracked for DART calculation |
| Days Restricted | Number | **HIPAA-protected** — tracked for DART calculation |

**HIPAA compliance:**
- All fields marked HIPAA-protected are encrypted at the field level in the database
- Access restricted to Safety Coordinator role and above
- Decrypted values never written to application logs
- Audit log records every access to medical fields (who, when, which record)

### 3.6 Railroad Property Auto-Detection

- When GPS coordinates are captured, the system checks against a stored set of **railroad property geofences** (polygons or radius zones)
- If the coordinates fall within a geofence, the "On Railroad Property" checkbox is auto-checked and the corresponding railroad is pre-selected
- The user can always override (uncheck or change railroad)
- Geofence data is admin-managed (CRUD for railroad property zones with name, railroad, and boundary coordinates)
- **Phase 1:** Simple radius-based zones (center point + radius in meters)
- **Future:** Polygon-based geofences if needed

---

## 4. Investigation Management

### 4.1 Investigation Assignment

- **Safety Manager** assigns:
  - Lead Investigator (any Safety Coordinator or Safety Manager)
  - Investigation Team members (optional, any user)
  - Target completion date (auto-calculated, manually adjustable)

**Auto-calculated target dates by severity:**
| Severity | Target Completion |
|---|---|
| Fatality | 48 hours from incident |
| Lost Time | 5 business days |
| Medical Treatment | 10 business days |
| First Aid | 14 calendar days |
| Near Miss | 14 calendar days |

### 4.2 Overdue Escalation

Escalation tiers (in-app notifications):
| Overdue By | Action |
|---|---|
| +3 days | Notification to Lead Investigator + Safety Manager |
| +7 days | Notification to Division Manager |
| +14 days | **Persistent banner** to Safety Manager + Division Manager + Executive |

### 4.3 5-Why Analysis

- Investigator builds a chain of **Why → Answer** pairs
- **Minimum 3 levels, no maximum**
- Each level contains:
  - Why question (text)
  - Answer (text)
  - Supporting Evidence (text + optional file attachments)
- Displayed as a **vertical visual sequence** with connecting arrows
- Root cause is the final "Answer" in the chain
- Root cause summary field (free text, populated from final answer, editable)

### 4.4 Contributing Factor Classification

- Factors selected from admin-configurable **FactorType library**
- Default categories:
  - **People** — Training deficiency, Fatigue, Complacency, Communication failure, Inexperience, Impairment, PPE non-compliance
  - **Equipment** — Malfunction, Poor maintenance, Improper use, Design deficiency, Missing guards/safeguards
  - **Environmental** — Weather, Lighting, Noise, Temperature, Terrain, Housekeeping
  - **Procedural** — No procedure exists, Procedure not followed, Procedure inadequate, Permit/clearance failure
  - **Management/Organizational** — Inadequate supervision, Scheduling pressure, Resource shortage, Culture/norm, Change management failure
- **One primary factor required**; additional contributing factors optional
- Each selected factor can include investigator notes

### 4.5 Witness Statements

| Field | Type |
|---|---|
| Witness Name | Text |
| Job Title | Text |
| Employer | Text |
| Phone | Text |
| Statement Text | Long Text |
| Collection Date | Date |
| Collected By | Auto (current user) |

- Multiple witness statements per investigation
- Statements cannot be edited after submission — corrections require a new statement entry referencing the original

### 4.6 Investigation Review

- **Safety Manager** reviews completed investigation
- Actions: **Approve** or **Return for Further Investigation**
- Return requires written comments explaining what's needed
- Approved investigation triggers a prompt to create CAPAs
- Investigation can be returned multiple times; each review cycle is logged

---

## 5. CAPA Management

### 5.1 CAPA Creation

- Created from investigation recommendations
- **A single CAPA can be linked to multiple incidents** (many-to-many relationship)
- Fields:
  - Type: Corrective / Preventive
  - Category: Training, Procedure Change, Engineering Control, PPE, Equipment Modification, Policy Change, Other
  - Description (text)
  - Assigned User
  - Priority: Critical, High, Medium, Low
  - Due Date (auto-calculated from priority, manually adjustable)
  - Verification Method (text — how effectiveness will be measured)
  - Linked Incidents (multi-select)

**Auto-calculated due dates by priority:**
| Priority | Action Due | Verification Due (post-completion) |
|---|---|---|
| Critical | 7 days | 30 days |
| High | 14 days | 60 days |
| Medium | 30 days | 90 days |
| Low | 60 days | 90 days |

### 5.2 CAPA Lifecycle

```
Open → In Progress → Completed → Verification Pending → Verified Effective
                                                       → Verified Ineffective
```

- **Open:** Created, assigned, not yet started
- **In Progress:** Assignee is actively working; notes and evidence can be added throughout
- **Completed:** Assignee marks done with completion notes and evidence (file uploads); system moves to Verification Pending and assigns verification due date
- **Verification Pending:** Awaiting effectiveness verification
- **Verified Effective:** Verifier confirms the action resolved the issue
- **Verified Ineffective:** Verifier determines the action did not resolve the issue
  - System prompts: **Create new CAPA** or **Reopen investigation**

**Rules:**
- Verifier must be a **different user** from the assignee
- All CAPAs linked to an incident must be **Verified Effective** before the incident can move to Closed
- Overdue CAPAs auto-flagged with escalation notifications matching investigation escalation tiers

### 5.3 CAPA Dashboard

- **KPI Cards:** Open CAPAs, Overdue CAPAs, Avg Time to Close, Effectiveness Rate (% Verified Effective / Total Verified)
- **Filterable CAPA table:** filter by status, priority, category, assignee, date range, linked incident
- **CAPA aging chart:** distribution of open CAPAs by age buckets

---

## 6. Manual Recurrence Linking

- **Safety Coordinator** (or above) can link two incidents as related
- Similarity type (select one or more):
  - Same Location
  - Same Type
  - Same Root Cause
  - Same Equipment
  - Same Person
- Linking notes (free text — explanation of relationship)
- **Bidirectional:** linked incidents are visible on each incident's **Recurrence tab**
- **Cluster view:** grouped card layout showing all linked incidents with common threads surfaced (shared factors, locations, people)

---

## 7. Safety Dashboard

### 7.1 KPI Cards (top row)

| KPI | Calculation | Display |
|---|---|---|
| TRIR | (Recordable Incidents x 200,000) / Total Hours Worked | Number with trend arrow (up/down vs. prior period) |
| DART Rate | (DART Cases x 200,000) / Total Hours Worked | Number with trend arrow |
| Near Miss Ratio | Near Miss Reports / Recordable Incidents | Ratio with trend |
| Open Investigations | Count of investigations not yet approved | Number |
| Open CAPAs | Count of CAPAs not yet Verified Effective | Number |
| Lost Work Days YTD | Sum of days-away for current calendar year | Number |

### 7.2 Charts

| Chart | Type | Details |
|---|---|---|
| Incident Trend by Month | Stacked bar | By incident type, 12-month rolling window |
| TRIR Trend | Line chart | Monthly TRIR with configurable industry benchmark reference line |
| Incidents by Division | Grouped bar | Division on x-axis, incident type as groups |
| Severity Distribution | Donut chart | By severity level |

### 7.3 Leading Indicators Card

| Indicator | Calculation |
|---|---|
| Near Miss Reporting Rate | Near misses reported per period vs. target |
| CAPA Closure Rate | CAPAs closed on-time / Total CAPAs due |
| Investigation Timeliness | Investigations completed on-time / Total investigations due |

Each shows target vs. actual with visual indicator (on-track / behind).

### 7.4 Recent Incidents Table
- Last 10 incidents: date, type, severity, status, division
- Clickable rows to navigate to incident detail

### 7.5 Hours Worked Data Entry
- **Safety Manager** manually enters total hours worked via admin configuration endpoint
- **Reporting period:** Calendar year (YTD) for primary dashboard display; 12-month rolling as an alternate view — consistent with OSHA 300 log conventions
- **Granularity:** Both **company-wide** and **per-division** — the dashboard requires division-scoped TRIR/DART calculations compared against the company average
- **Entry method:** Manual entry through the configuration UI (HR system import is an identified integration point but out of scope for this build)
- Historical entries editable with full audit trail
- System validates that hours worked are entered before TRIR/DART calculations can be displayed for a given period

### 7.6 Dashboard Filters
- Date range
- Division
- Project / Job Site
- Incident Type
- All charts and KPIs respond to active filters

---

## 8. Notifications System

### 8.1 In-App Notification Bell / Inbox

- **Notification bell** in the top navigation bar with unread count badge
- Clicking opens a **notification inbox** panel/drawer
- Each notification shows: icon, title, summary, timestamp, read/unread state
- Click-through navigates to the relevant record
- Mark as read / mark all as read
- Notification history retained for 90 days

### 8.2 Persistent Banner

- Used for **highest escalation tier only** (+14 days overdue)
- Full-width banner at top of the application (below nav bar)
- Cannot be permanently dismissed — remains until the underlying issue is resolved
- Can be temporarily collapsed for the current session
- Uses Warning Amber from Herzog Brand System

### 8.3 Notification Triggers

| Event | Recipients | Type |
|---|---|---|
| New incident reported | Safety Manager (division) | Bell |
| Investigation assigned | Lead Investigator, Team | Bell |
| Investigation overdue +3d | Lead Investigator, Safety Manager | Bell |
| Investigation overdue +7d | Division Manager | Bell |
| Investigation overdue +14d | Safety Manager, Div Manager, Executive | **Persistent Banner** |
| Investigation returned | Lead Investigator | Bell |
| Investigation approved | Lead Investigator | Bell |
| CAPA assigned | Assignee | Bell |
| CAPA overdue | Assignee, Safety Manager | Bell |
| CAPA verification due | Verifier | Bell |
| Railroad notification overdue | Safety Manager, Safety Coordinator | Bell (escalates to Banner if >2x deadline) |
| CAPA verified ineffective | Safety Manager, Lead Investigator | Bell |

---

## 9. PDF Report Generation

### 9.1 Incident Report PDF

Generates a comprehensive, printable PDF containing:

1. **Header:** Herzog logo, "Incident Report", report number, generation date
2. **Investigation Summary** (at the top, per user request)
   - Root cause (from 5-Why)
   - Primary contributing factor
   - Key findings narrative
   - CAPA summary (count, statuses)
3. **Incident Details:** All incident form fields
4. **OSHA Determination:** Recordability decision with rationale
5. **Railroad Notification Log:** If applicable
6. **Injured Person Details:** (only if viewer has medical data access)
7. **5-Why Analysis:** Visual chain rendered in print format
8. **Contributing Factors:** Listed with notes
9. **Witness Statements:** Full text of each
10. **CAPA Details:** Table of all linked CAPAs with status
11. **Recurrence Links:** Related incidents if any
12. **Audit Trail Summary:** Key status transitions with timestamps
13. **Footer:** Page numbers, confidentiality notice

### 9.2 Access Control
- PDF generation available to Safety Coordinator and above
- Medical data fields are **redacted** in the PDF if the requesting user does not have medical data access
- PDF generation is audit-logged

---

## 10. Incident Status Flow

```
Reported
  → Under Investigation (when investigator assigned)
    → Investigation Complete (when lead investigator submits)
      → Investigation Approved (when Safety Manager approves)
        → CAPA Assigned (when CAPAs are created)
          → CAPA In Progress (when any CAPA moves to In Progress)
            → Closed (all CAPAs Verified Effective)

Closed → Reopened (triggered by new information, recurrence detection, or ineffective CAPA verification)
  → Under Investigation (follows the same full investigation workflow from the start)

Under Investigation ← Investigation Returned (Safety Manager returns for more work)
```

### 10.1 Reopening Rules

- **Triggers for reopening:**
  - New information surfaces after closure
  - Recurrence detected (via manual linking)
  - CAPA verified as ineffective — system prompts user to either create a new CAPA or reopen the investigation
- **Who can reopen:** Safety Manager, Safety Coordinator, Admin
- **Reopened incident flows back to Under Investigation** and follows the same complete workflow (assignment → 5-Why → review → CAPA → closure)
- The original investigation and CAPAs are preserved as historical records; a new investigation is created linked to the same incident
- Reopen count is tracked on the incident record
- All reopening events are audit-logged with reason

---

## 11. Audit Logging

### 11.1 Scope
Every state change and data access to sensitive fields is immutably logged:

- Incident CRUD operations
- Status transitions
- Field edits (old value → new value)
- OSHA recordability overrides (with justification)
- Investigation actions (assignment, submission, approval, return)
- CAPA lifecycle transitions
- Witness statement submissions
- Medical data field access (read and write)
- PDF report generation
- Recurrence link creation/deletion
- User login/logout
- Admin configuration changes (railroad rules, factor types, etc.)

### 11.2 Audit Record Schema
| Field | Description |
|---|---|
| id | Unique identifier |
| timestamp | UTC timestamp |
| user_id | Who performed the action |
| action | Action type (CREATE, UPDATE, DELETE, READ, STATUS_CHANGE, etc.) |
| entity_type | What was affected (Incident, Investigation, CAPA, etc.) |
| entity_id | ID of the affected record |
| field_name | Specific field changed (if applicable) |
| old_value | Previous value |
| new_value | New value |
| justification | Required text for overrides |
| ip_address | Client IP |
| user_agent | Client browser/device info |

### 11.3 Access & Retention
- Audit logs viewable by **Admin** role only
- Searchable by entity, user, date range, action type
- **Retained permanently** — no automatic purging
- Audit logs themselves are append-only (cannot be edited or deleted)

---

## 12. Security & Compliance

### 12.1 Authentication
- **Azure AD SSO** — sole authentication method
- No local username/password authentication
- Session management via secure tokens with configurable timeout

### 12.2 Authorization
- Role-Based Access Control (RBAC) as defined in Section 2
- Division-scoped data access for PM and Division Manager roles
- All API endpoints enforce authorization server-side

### 12.3 Data Protection
- **TLS 1.2+** for all data in transit
- **Field-level encryption** for HIPAA-protected medical data (AES-256)
- Encryption keys managed via a dedicated key management approach (Azure Key Vault recommended for production)
- Photos stored in object storage with access controlled by application authorization
- No medical data in application logs or error reports

### 12.4 HIPAA Applicability
- System handles Protected Health Information (PHI): injured person names linked to injury/treatment data
- Field-level encryption for all PHI fields
- Access restricted by role (Safety Coordinator and above)
- Audit trail for all PHI access
- Minimum necessary principle: API responses only include PHI fields when the requesting user has access

### 12.5 Standards
- **WCAG 2.1 AA** — full accessibility compliance
- **Mobile-responsive** — minimum viewport 375px
- **Herzog UI Brand System** — applied throughout (see `herzog-branding SKILL.md`)

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Page load: < 2 seconds on standard connection
- Dashboard with 12 months of data: < 3 seconds
- Search results: < 1 second
- Photo upload: progress indicator, max 10MB per file
- Concurrent users: support 500+ simultaneous users

### 13.2 Availability
- Target: 99.5% uptime during business hours (6 AM - 10 PM local, all US time zones)
- Incident reporting available 24/7

### 13.3 Deployment
- **Dockerized** — all application components containerized
- Docker Compose for local development
- Container orchestration for production (Kubernetes or Azure Container Apps — TBD)
- GitHub for source control
- GitHub Actions for CI/CD workflows
- PR-based development workflow

### 13.4 Database
- Local database for development with seed/dummy data
- **Connection layer must be abstracted** so the database provider can be swapped to a production system (e.g., Azure SQL, managed PostgreSQL) with configuration changes only — no code changes
- Migrations managed via code-first ORM

### 13.5 Modularity
- **GPS/Location service** — abstracted behind an interface; browser Geolocation API is the initial implementation; swappable to a different provider
- **Notification delivery** — abstracted; in-app is the initial implementation; interface ready for email/push in future
- **PDF generation** — behind a service interface
- **Storage (photos)** — abstracted; local filesystem for dev, object storage for production

### 13.6 Internationalization
- **Phase 1:** English only
- Date/time: display in user's local timezone; store in UTC
- Currency: N/A
- Number formats: US standard (commas for thousands, period for decimal)

---

## 14. Data Model — Key Entities

> Full schema will be defined during design phase. Below are the primary entities and relationships.

- **Incident** — core record; has one Status, one Severity, one Division, one Project
- **InjuredPerson** — 1:many from Incident (an incident may have multiple injured persons)
- **Investigation** — 1:1 with Incident; has lead investigator, team members
- **FiveWhyEntry** — ordered chain; belongs to Investigation
- **ContributingFactor** — many:many between Investigation and FactorType
- **FactorType** — admin-configurable lookup; has Category
- **WitnessStatement** — many per Investigation
- **CAPA** — many:many with Incident; has assignee, verifier, lifecycle status
- **RecurrenceLink** — join table linking two Incidents with similarity type + notes
- **Railroad** — admin-configurable; has notification rules per incident type
- **RailroadNotification** — tracks notification status per incident/railroad
- **RailroadPropertyZone** — geofence data (center point + radius or polygon)
- **Notification** — in-app notifications; has recipient, read status, link target
- **AuditLog** — immutable append-only log
- **HoursWorked** — manual entry per period; company-wide and per-division
- **ShiftWindow** — configurable shift definitions (name, start time, end time) used for "within shift" deadline calculations
- **User** — synced from Azure AD; has role, division assignments
- **Division** — organizational unit
- **Project** — job site; belongs to division

---

## 15. Confirmed Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | Component-heavy UI, complex state machines |
| **UI Charts** | Recharts or Nivo | Dashboard visualizations |
| **Backend** | C# / ASP.NET Core 8 Web API | First-class Azure AD, EF Core, RBAC middleware |
| **ORM** | Entity Framework Core | Code-first migrations, swappable DB providers, field-level encryption via value converters |
| **Database** | PostgreSQL (Docker for dev) | PostGIS for geofencing, JSON columns for audit metadata; swap to Azure Database for PostgreSQL in production |
| **Auth** | Azure AD SSO via MSAL + Microsoft.Identity.Web | JWT tokens, role claims from AD groups |
| **Photo Storage** | Local filesystem (dev) → Azure Blob Storage (prod) | Abstracted behind storage service interface |
| **PDF Generation** | Server-side service (QuestPDF or similar) | Behind service interface |
| **Containerization** | Docker + Docker Compose | Multi-stage builds; ready for K8s / Azure Container Apps |
| **CI/CD** | GitHub Actions | Build, test, lint, Docker image per PR |
| **Source Control** | GitHub | PR-based workflow, branch protection on main |

---

## 16. Deferred Features (Future Phases)

Explicitly out of scope for this build, but the data model and architecture should not preclude them:

1. **Offline incident reporting** — service worker, photo queuing, sync queue
2. **Fishbone / Ishikawa diagram** — visual rendering of contributing factors (data is captured)
3. **Automated recurrence detection** — ML/rule-based matching of new incidents to historical data
4. **Advanced analytics** — body part heat map, hour/day heatmaps, division radar charts
5. **OSHA 300/300A/301 log generation** — formatted regulatory exports (data is captured)
6. **Training system CAPA integration** — verify training CAPAs via external system
7. **Email/push notifications** — outbound delivery channels (notification interface is abstracted)
