ASTRA SIMULATED DATA PACK
All operational readings in this pack are fictional demonstration data. They are not real astronaut telemetry, NASA data, clinical records, or medically validated thresholds.

FILES
- astronaut_profiles.csv: four fictional crew profiles and example personal baseline values.
- daily_health_monitoring.csv: 4 astronauts x 90 days (360 rows). Days 1-30 are PRE_MISSION; days 31-90 are IN_MISSION. Contains heart rate, blood pressure, temperature, SpO2, sleep, mood, stress, exercise and symptoms.
- radiation_log.csv: fictional daily radiation dose and cumulative recorded dose.
- cabin_environment_log.csv: fictional cabin CO2, temperature, pressure and humidity readings; pre-mission readings are blank.
- mission_profiles.csv: fictional planned and extended mission durations.
- health_guidance.json: example offline guidance across the five spaceflight hazards. Review by qualified personnel is required before real-world use.

DEMO SCENARIOS
- AST001 has an intentionally inserted multi-indicator pattern on study days 50-55: shorter sleep, higher heart rate, high stress, lower mood and reduced exercise.
- AST003 has a simulated sleep/stress trend on study days 72-78.
These scenarios let the team test trend charts and demonstration alerts.

FEATURE MAPPING
Dashboard: daily_health_monitoring.csv + astronaut_profiles.csv
Daily check-in: append new entries using daily_health_monitoring.csv columns
Personal baseline: compare mission readings with PRE_MISSION readings/profile baselines
Cross-hazard pattern detection: daily health + radiation + cabin environment logs
AI explanations: explain flagged patterns using reviewed guidance
Mission extension: mission_profiles.csv
Health history: daily_health_monitoring.csv
Offline guidance: health_guidance.json

Keep NASA OSD-575 files separate. OSD-575 contains biological research measurements from Inspiration4 serum samples; it is not daily wearable telemetry. Label every synthetic chart/table "Simulated demo data". ASTRA is not a diagnostic tool. Any alert thresholds are prototype demonstration rules, not NASA medical thresholds.
