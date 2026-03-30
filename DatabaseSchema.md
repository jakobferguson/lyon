# Lyon Database Schema

> PostgreSQL 16 + PostGIS 3.4 — Code-first via Entity Framework Core

---

## Entity-Relationship Overview

```
Division 1──∞ Project
Division 1──∞ User
Division 1──∞ HoursWorked

User 1──∞ Incident (reported_by)
Division 1──∞ Incident
Project 1──∞ Incident

Incident 1──∞ InjuredPerson
Incident 1──∞ IncidentPhoto
Incident 1──0..1 Investigation
Incident ∞──∞ Capa (via CapaIncident)
Incident ∞──∞ Incident (via RecurrenceLink)
Incident 1──∞ RailroadNotification

Investigation 1──∞ FiveWhyEntry
Investigation 1──∞ ContributingFactor
Investigation 1──∞ WitnessStatement

FactorType 1──∞ ContributingFactor

Railroad 1──∞ RailroadNotificationRule
Railroad 1──∞ RailroadPropertyZone
Railroad 1──∞ RailroadNotification

User 1──∞ Notification (recipient)
AuditLogEntry (append-only, no FK constraints)
ShiftWindow (global config)
```

---

## Tables

### divisions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| code | varchar(20) | NOT NULL, UNIQUE | e.g. 'HCC', 'HRSI' |
| name | varchar(100) | NOT NULL | Full display name |
| is_active | boolean | NOT NULL DEFAULT true | Soft-active flag |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

### users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| azure_ad_object_id | varchar(100) | NOT NULL, UNIQUE | From Azure AD |
| email | varchar(320) | NOT NULL, UNIQUE | |
| display_name | varchar(200) | NOT NULL | |
| role | varchar(30) | NOT NULL | Enum: field_reporter, safety_coordinator, safety_manager, project_manager, division_manager, executive, admin |
| division_id | uuid | FK → divisions(id) | NULL for executives/admins with multi-division access |
| is_active | boolean | NOT NULL DEFAULT true | |
| last_login_at | timestamptz | | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_users_azure_ad_object_id` UNIQUE, `ix_users_email` UNIQUE, `ix_users_division_id`

### projects

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| name | varchar(200) | NOT NULL | |
| code | varchar(50) | | Optional short code |
| division_id | uuid | FK → divisions(id), NOT NULL | |
| is_active | boolean | NOT NULL DEFAULT true | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_projects_division_id`

### incidents

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_number | varchar(20) | NOT NULL, UNIQUE | Auto-generated: INC-YYYY-NNN |
| incident_type | varchar(30) | NOT NULL | Enum: Injury, NearMiss, PropertyDamage, Environmental, Vehicle, Fire, UtilityStrike |
| date_time | timestamptz | NOT NULL | Incident occurrence time |
| timezone_id | varchar(50) | NOT NULL | IANA timezone ID |
| description | text | NOT NULL | |
| severity | varchar(30) | | Enum: Fatality, LostTime, MedicalTreatment, FirstAid, NearMiss |
| potential_severity | varchar(30) | | Same enum |
| status | varchar(30) | NOT NULL DEFAULT 'Draft' | Enum: Draft, Reported, UnderInvestigation, InvestigationComplete, InvestigationApproved, CapaAssigned, CapaInProgress, Closed, Reopened |
| division_id | uuid | FK → divisions(id) | |
| project_id | uuid | FK → projects(id) | |
| reported_by_id | uuid | FK → users(id), NOT NULL | |
| location_latitude | double precision | | GPS latitude |
| location_longitude | double precision | | GPS longitude |
| location_description | varchar(500) | NOT NULL | Text description |
| location_gps_source | varchar(10) | NOT NULL DEFAULT 'manual' | 'gps' or 'manual' |
| location_point | geometry(Point,4326) | | PostGIS point for geofencing |
| immediate_actions | text | | |
| shift | varchar(10) | | Enum: Day, Night, Swing |
| shift_start | time | | |
| shift_end | time | | |
| weather | varchar(20) | | Enum: Clear, Rain, Snow, Ice, Fog, Wind, ExtremeHeat, ExtremeCold |
| on_railroad_property | boolean | NOT NULL DEFAULT false | |
| railroad_id | uuid | FK → railroads(id) | Required if on_railroad_property |
| is_osha_recordable | boolean | | NULL = not determined |
| is_dart | boolean | | |
| osha_override_justification | text | | Required if user overrode auto-determination |
| osha_determined_by_id | uuid | FK → users(id) | |
| reopen_count | int | NOT NULL DEFAULT 0 | |
| is_deleted | boolean | NOT NULL DEFAULT false | Soft delete |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_incidents_incident_number` UNIQUE, `ix_incidents_status`, `ix_incidents_division_id`, `ix_incidents_reported_by_id`, `ix_incidents_date_time`, `ix_incidents_location_point` GIST (PostGIS spatial), `ix_incidents_incident_type`, `ix_incidents_is_deleted`

### incident_photos

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_id | uuid | FK → incidents(id), NOT NULL | |
| file_name | varchar(255) | NOT NULL | Original filename |
| storage_path | varchar(500) | NOT NULL | Blob/local path |
| content_type | varchar(50) | NOT NULL | MIME type |
| file_size_bytes | bigint | NOT NULL | |
| sort_order | int | NOT NULL DEFAULT 0 | |
| uploaded_by_id | uuid | FK → users(id), NOT NULL | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_incident_photos_incident_id`

### injured_persons

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_id | uuid | FK → incidents(id), NOT NULL | |
| name | varchar(500) | NOT NULL | **ENCRYPTED** — HIPAA |
| job_title | varchar(200) | | |
| division_id | uuid | FK → divisions(id) | |
| injury_type | varchar(30) | | Enum |
| body_part | varchar(20) | | Enum |
| body_side | varchar(15) | | Enum |
| treatment_type | varchar(500) | | **ENCRYPTED** — HIPAA |
| return_to_work_status | varchar(500) | | **ENCRYPTED** — HIPAA |
| days_away | varchar(500) | | **ENCRYPTED** — HIPAA (stored as encrypted string) |
| days_restricted | varchar(500) | | **ENCRYPTED** — HIPAA (stored as encrypted string) |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_injured_persons_incident_id`

### investigations

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_id | uuid | FK → incidents(id), NOT NULL, UNIQUE | 1:1 per lifecycle (new investigation on reopen) |
| lead_investigator_id | uuid | FK → users(id), NOT NULL | |
| assigned_by_id | uuid | FK → users(id), NOT NULL | |
| target_completion_date | timestamptz | NOT NULL | Auto-calculated, manually adjustable |
| actual_completion_date | timestamptz | | |
| root_cause_summary | text | | Editable summary |
| status | varchar(30) | NOT NULL DEFAULT 'Open' | Open, InProgress, Complete, Approved, Returned |
| review_comments | text | | Safety Manager comments on return |
| reviewed_by_id | uuid | FK → users(id) | |
| reviewed_at | timestamptz | | |
| investigation_number | int | NOT NULL DEFAULT 1 | Increments on reopen |
| is_deleted | boolean | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_investigations_incident_id`, `ix_investigations_lead_investigator_id`, `ix_investigations_status`, `ix_investigations_target_completion_date`

### investigation_team_members

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| investigation_id | uuid | FK → investigations(id), NOT NULL | Composite PK |
| user_id | uuid | FK → users(id), NOT NULL | Composite PK |
| added_at | timestamptz | NOT NULL DEFAULT now() | |

### five_why_entries

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| investigation_id | uuid | FK → investigations(id), NOT NULL | |
| level | int | NOT NULL | 1-based order |
| why_question | text | NOT NULL | |
| answer | text | NOT NULL | |
| supporting_evidence | text | | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_five_why_entries_investigation_id`, UNIQUE(`investigation_id`, `level`)

### factor_types

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| category | varchar(30) | NOT NULL | People, Equipment, Environmental, Procedural, ManagementOrganizational |
| name | varchar(200) | NOT NULL | |
| description | text | | |
| is_active | boolean | NOT NULL DEFAULT true | |
| sort_order | int | NOT NULL DEFAULT 0 | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE(`category`, `name`)

### contributing_factors

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| investigation_id | uuid | FK → investigations(id), NOT NULL | |
| factor_type_id | uuid | FK → factor_types(id), NOT NULL | |
| is_primary | boolean | NOT NULL DEFAULT false | One per investigation must be true |
| notes | text | | Investigator notes |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_contributing_factors_investigation_id`, `ix_contributing_factors_factor_type_id`

### witness_statements

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| investigation_id | uuid | FK → investigations(id), NOT NULL | |
| witness_name | varchar(200) | NOT NULL | |
| job_title | varchar(200) | | |
| employer | varchar(200) | | |
| phone | varchar(30) | | |
| statement_text | text | NOT NULL | |
| collection_date | date | NOT NULL | |
| collected_by_id | uuid | FK → users(id), NOT NULL | |
| references_statement_id | uuid | FK → witness_statements(id) | For corrections |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_witness_statements_investigation_id`

> **Immutability:** Witness statements cannot be updated. Corrections are new rows with `references_statement_id` pointing to the original.

### capas

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| capa_number | varchar(20) | NOT NULL, UNIQUE | Auto-generated: CAPA-YYYY-NNN |
| type | varchar(15) | NOT NULL | Corrective, Preventive |
| category | varchar(30) | NOT NULL | Training, ProcedureChange, EngineeringControl, PPE, EquipmentModification, PolicyChange, Other |
| description | text | NOT NULL | |
| assigned_to_id | uuid | FK → users(id), NOT NULL | |
| verified_by_id | uuid | FK → users(id) | Must differ from assigned_to_id |
| priority | varchar(10) | NOT NULL | Critical, High, Medium, Low |
| status | varchar(30) | NOT NULL DEFAULT 'Open' | Open, InProgress, Completed, VerificationPending, VerifiedEffective, VerifiedIneffective |
| due_date | timestamptz | NOT NULL | Auto-calculated from priority |
| verification_due_date | timestamptz | | Set when completed |
| verification_method | text | | How effectiveness will be measured |
| completion_notes | text | | |
| verification_notes | text | | |
| completed_at | timestamptz | | |
| verified_at | timestamptz | | |
| is_deleted | boolean | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_capas_capa_number` UNIQUE, `ix_capas_status`, `ix_capas_assigned_to_id`, `ix_capas_due_date`, `ix_capas_priority`

### capa_incidents (join table)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| capa_id | uuid | FK → capas(id), NOT NULL | Composite PK |
| incident_id | uuid | FK → incidents(id), NOT NULL | Composite PK |

### recurrence_links

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_a_id | uuid | FK → incidents(id), NOT NULL | |
| incident_b_id | uuid | FK → incidents(id), NOT NULL | |
| similarity_types | varchar(200) | NOT NULL | Comma-separated: SameLocation, SameType, SameRootCause, SameEquipment, SamePerson |
| notes | text | | |
| linked_by_id | uuid | FK → users(id), NOT NULL | |
| is_deleted | boolean | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE(`incident_a_id`, `incident_b_id`), `ix_recurrence_links_incident_a_id`, `ix_recurrence_links_incident_b_id`

> **Bidirectional:** Always store with `incident_a_id < incident_b_id` to prevent duplicates. Query both directions.

### railroads

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| name | varchar(100) | NOT NULL, UNIQUE | e.g. 'BNSF', 'UP' |
| code | varchar(20) | NOT NULL, UNIQUE | Short code |
| is_active | boolean | NOT NULL DEFAULT true | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

### railroad_notification_rules

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| railroad_id | uuid | FK → railroads(id), NOT NULL | |
| incident_type | varchar(30) | NOT NULL | Matches incident_type enum |
| deadline_minutes | int | NOT NULL | 15 = "immediately", 1440 = 24h, etc. |
| is_within_shift | boolean | NOT NULL DEFAULT false | True = deadline is end of shift |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE(`railroad_id`, `incident_type`)

### railroad_property_zones

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| railroad_id | uuid | FK → railroads(id), NOT NULL | |
| name | varchar(200) | NOT NULL | Zone name |
| center_latitude | double precision | NOT NULL | |
| center_longitude | double precision | NOT NULL | |
| radius_meters | double precision | NOT NULL | |
| boundary | geometry(Point,4326) | | PostGIS point (center) |
| is_active | boolean | NOT NULL DEFAULT true | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_railroad_property_zones_railroad_id`, `ix_railroad_property_zones_boundary` GIST

### railroad_notifications

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| incident_id | uuid | FK → incidents(id), NOT NULL | |
| railroad_id | uuid | FK → railroads(id), NOT NULL | |
| was_notified | boolean | NOT NULL DEFAULT false | |
| notification_date_time | timestamptz | | |
| method | varchar(20) | | Phone, Email, InPerson, Radio, Other |
| person_notified | varchar(200) | | |
| person_title | varchar(200) | | |
| notes | text | | |
| deadline | timestamptz | NOT NULL | Calculated from rules |
| is_overdue | boolean | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** `ix_railroad_notifications_incident_id`, `ix_railroad_notifications_is_overdue`

### notifications

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| recipient_id | uuid | FK → users(id), NOT NULL | |
| type | varchar(50) | NOT NULL | Enum: NewIncident, InvestigationAssigned, InvestigationOverdue, etc. |
| title | varchar(300) | NOT NULL | |
| summary | varchar(500) | NOT NULL | |
| entity_type | varchar(50) | | Incident, Investigation, Capa |
| entity_id | uuid | | For click-through navigation |
| is_read | boolean | NOT NULL DEFAULT false | |
| is_persistent_banner | boolean | NOT NULL DEFAULT false | +14d overdue escalation |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| read_at | timestamptz | | |
| expires_at | timestamptz | | 90-day retention |

**Indexes:** `ix_notifications_recipient_id_is_read`, `ix_notifications_created_at`, `ix_notifications_is_persistent_banner`

### audit_log_entries

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK, GENERATED ALWAYS AS IDENTITY | Sequential for performance |
| timestamp | timestamptz | NOT NULL DEFAULT now() | |
| user_id | uuid | NOT NULL | No FK — append-only isolation |
| user_display_name | varchar(200) | NOT NULL | Denormalized for query |
| action | varchar(30) | NOT NULL | CREATE, UPDATE, DELETE, READ, STATUS_CHANGE, OSHA_OVERRIDE, LOGIN, LOGOUT, PDF_GENERATE |
| entity_type | varchar(50) | NOT NULL | |
| entity_id | uuid | NOT NULL | |
| field_name | varchar(100) | | Specific field if applicable |
| old_value | text | | **Never contains plaintext PHI** |
| new_value | text | | **Never contains plaintext PHI** |
| justification | text | | For overrides |
| ip_address | varchar(45) | | IPv4/IPv6 |
| user_agent | varchar(500) | | |
| correlation_id | varchar(50) | | Request correlation |

**Indexes:** `ix_audit_log_entries_entity_type_entity_id`, `ix_audit_log_entries_user_id`, `ix_audit_log_entries_timestamp`, `ix_audit_log_entries_action`

> **Immutability enforced at DB level:** No UPDATE or DELETE grants on this table for the application role. Application connects with a role that has INSERT + SELECT only.

### hours_worked

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| year | int | NOT NULL | Calendar year |
| month | int | NOT NULL | 1-12 |
| division_id | uuid | FK → divisions(id) | NULL = company-wide total |
| hours | decimal(12,2) | NOT NULL | |
| entered_by_id | uuid | FK → users(id), NOT NULL | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE(`year`, `month`, `division_id`)

### shift_windows

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK | |
| name | varchar(20) | NOT NULL, UNIQUE | Day, Night, Swing |
| start_time | time | NOT NULL | |
| end_time | time | NOT NULL | May cross midnight |
| is_active | boolean | NOT NULL DEFAULT true | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

---

## Seed Data

### Divisions
| Code | Name |
|------|------|
| HCC | Herzog Contracting Corp |
| HRSI | Herzog Railroad Services Inc |
| HSI | Herzog Services Inc |
| HTI | Herzog Technologies Inc |
| HTSI | Herzog Transit Services Inc |
| HE | Herzog Energy |
| GG | Green Group |

### Railroads + Notification Rules
| Railroad | Injury | Near Miss | Property Damage |
|----------|--------|-----------|-----------------|
| BNSF | 120 min | 1440 min (24h) | 240 min (4h) |
| UP | 15 min (immediately) | 1440 min (24h) | 120 min (2h) |
| CSX | 60 min | within_shift | 60 min |
| NS | 120 min | 1440 min (24h) | 120 min (2h) |

### Shift Windows
| Name | Start | End |
|------|-------|-----|
| Day | 06:00 | 18:00 |
| Night | 18:00 | 06:00 |
| Swing | 14:00 | 02:00 |

### Factor Types (default library)
**People:** Training deficiency, Fatigue, Complacency, Communication failure, Inexperience, Impairment, PPE non-compliance
**Equipment:** Malfunction, Poor maintenance, Improper use, Design deficiency, Missing guards/safeguards
**Environmental:** Weather, Lighting, Noise, Temperature, Terrain, Housekeeping
**Procedural:** No procedure exists, Procedure not followed, Procedure inadequate, Permit/clearance failure
**Management/Organizational:** Inadequate supervision, Scheduling pressure, Resource shortage, Culture/norm, Change management failure

### Dev Users (for VITE_DEV_AUTH mode)
| Email | Display Name | Role | Division |
|-------|-------------|------|----------|
| admin@herzog.dev | Admin User | admin | — |
| safetymgr@herzog.dev | Sarah Safety | safety_manager | HCC |
| coordinator@herzog.dev | Chris Coordinator | safety_coordinator | HRSI |
| reporter@herzog.dev | Riley Reporter | field_reporter | HSI |
| projmgr@herzog.dev | Pat Manager | project_manager | HTI |
| divmgr@herzog.dev | Dana Division | division_manager | HTSI |
| exec@herzog.dev | Eva Executive | executive | — |
