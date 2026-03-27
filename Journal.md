# lyon
Formatting:
DateTimeGroup
Action
Notes
Next steps

3/27/2026 8:20
Begin Research
Read over base requirements document.
Begin getting an understanding of what it is I am actually building.
Gather any data and documents referenced, drop into claude, begin building extended requirements document.

3/27/2026 9:45
Extended Requirements Complete
All open questions resolved. ExtendedRequirements.md created with full coverage:
- Incident reporting with OSHA decision tree, railroad notification tracking, shift-based deadlines
- Investigation workflow with reopening rules (Closed → Reopened → Under Investigation)
- CAPA management with many-to-many incident linking, ineffective CAPA triggers reopen
- Hours worked: YTD + 12-month rolling, company-wide + per-division, manual entry
- Shift windows configurable (Day 06-18, Night 18-06, Swing 14-02) for "within shift" deadlines
- Tech stack confirmed: React/TS + ASP.NET Core 8 + PostgreSQL + Docker
Next steps: Architecture design, project scaffolding, database schema.