# ASTRA HEALTH — Astronaut Health Monitoring System
### Minimalist, Modern Web-Based Health Telemetry Platform (Frontend Prototype)

**ASTRA HEALTH** is a clean, modern, and minimalist astronaut health monitoring system designed for crew members during long-duration spaceflight missions (e.g., Mission ORION-07, Day 124). It bridges onboard telemetry with personal healthcare management, prioritizing clinical readability, soft calm visuals, and intuitive navigation.

---

## 🎨 Design Theme & Aesthetic

- **Color Scheme:** Soft Blue (`#0284C7`, `#0EA5E9`, `#F0F7FF`) and Warm White (`#FAFBFD`, `#FFFFFF`).
- **Visual Style:** Minimalist, uncluttered, plenty of whitespace, clean Inter typography, subtle borders (`border-slate-200/80`), soft shadows (`shadow-subtle`), and moderately rounded corners (`rounded-xl`).
- **Responsive:** Full cross-device support (Desktop, Tablet, Mobile) with an off-canvas drawer navigation for mobile viewports.

---

## 🚀 Implemented Sections

1. **Dashboard**
   - Welcome banner: "Health Overview", "Welcome back, Commander", Mission `ORION-07` • `DAY 124`.
   - Overall health status card: Status `Stable`, Health score `92/100`, composite explanation.
   - 5 Real-time metrics: Heart Rate (`72 BPM`), Blood Pressure (`118/78 mmHg`), Body Temperature (`36.8°C`), Sleep (`7.5 hours`), Mood (`Good`).
   - Interactive Recharts health trends: Heart rate line chart and Sleep duration bar chart with `24 hours`, `7 days`, and `30 days` interactive time filters.
   - Recent alerts: 3 mission notifications with timestamps and severity indicators.
   - Daily health tasks: 5 interactive tasks with real-time checkboxes, completion counter, and visual progress bar.

2. **AI Medical Assistant**
   - Chat-based interface with Demo Mode indicator and aerospace medicine advisory badge.
   - 4 Quick-prompt questions ("Why is my heart rate higher today?", "How can I improve my sleep?", etc.).
   - Interactive message history with typing simulation and realistic contextual medical responses based on telemetry data.
   - Medical disclaimer regarding preliminary health guidance.

3. **Personal Health Information**
   - Astronaut identification: Alex Morgan (ID: AST-024, Commander & Lead Specialist, Age: 32, Blood Group: O+, Height: 180 cm, Weight: 74 kg).
   - Physiological terrestrial health baselines (Resting HR 65–75 BPM, BP 110/70–120/80, Temp 36.5–37.2°C, Sleep 8.0h, Mood Stable).
   - Medical history, allergies, and current medications.
   - Certified pre-mission flight physical summary.
   - **Interactive Edit Profile modal:** Updates astronaut data across the entire application using React state.

4. **Predictive Analytics**
   - Overview status cards: Heart rate (`Within baseline`), Sleep (`Slight decrease`), Blood pressure (`Stable`).
   - 3 Recharts trends: Heart rate trend, Sleep duration trend, and Dual-line Blood Pressure trend (Systolic / Diastolic) with `7 days`, `30 days`, and `90 days` interactive filters.
   - Baseline comparison table: Delta tracking against pre-mission qualification metrics.
   - Flight surgeon observations with clear status tags (`Normal`, `Monitor`, `Attention`).

5. **Health Recommendations**
   - 4 categorized protocols: Physical Activity (ARED, Cycle Ergometer, Spinal Decompression), Sleep Management (Circadian Light, Acoustic pod, Sleep window), Stress Management (Box Breathing, Earth sensory immersion, Journaling), Preventive Health (Electrolyte hydration, Vitamin D3, Midday vitals).
   - Interactive completion checkboxes on every protocol item.
   - Follow-up task section with completion progress counter (`x/4 completed`).

6. **Settings**
   - Flight parameters & orbital telemetry sync.
   - Biometric sensor pairings toggle (Smart patch, ECG band, Sleep pod sensor).
   - Notification preferences (Vital thresholds, circadian audio chimes, protocol prompts).
   - Reset Demo Data to initial defaults.

---

## 📁 Compact Code Architecture (12 Application Files)

```text
src/
├── App.tsx                     # Core state (active route, astronaut profile, tasks) & layout
├── components.tsx              # Shared Sidebar, Header, Card, Badge & MetricCard
├── types.ts                    # TypeScript interfaces & navigation types
├── data.ts                     # Mock datasets, initial profile, trends, and assistant responses
├── index.css                   # Tailwind styling & clean typography
├── main.tsx                    # React root mount
└── pages/
    ├── Dashboard.tsx           # Health overview, 5 metrics, Recharts trends, alerts & tasks
    ├── AiAssistant.tsx         # Chat interface, prompt chips & clinical responses
    ├── PersonalHealth.tsx      # Personal records, baselines & editable profile form
    ├── PredictiveAnalytics.tsx # Overview cards, 3 Recharts trends & comparison table
    ├── HealthRecommendations.tsx # 4-category recommendation grid & follow-up tasks
    └── Settings.tsx            # Mission configuration, sensor pairings & reset demo data
```

---

## 🛠️ Technology Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Soft Blue & Warm White palette)
- **Data Visualization:** Recharts
- **Iconography:** Lucide React
- **Status:** Frontend-Only prototype (zero external APIs, backend, or machine learning models)
