# ASTRA HEALTH — Astronaut Health Monitoring System
### Minimalist, Modern Web-Based Health Telemetry Platform

**ASTRA HEALTH** is a clean, modern, and minimalist astronaut health monitoring system designed for crew members during long-duration spaceflight missions (e.g., Mission ORION-07, Day 124). It bridges onboard telemetry with personal healthcare management, prioritizing clinical readability, soft calm visuals, and intuitive navigation.

---

##  Design Theme & Aesthetic

- **Color Scheme:** Soft Blue (`#0284C7`, `#0EA5E9`, `#F0F7FF`) and Warm White (`#FAFBFD`, `#FFFFFF`).
- **Visual Style:** Minimalist, uncluttered, plenty of whitespace, clean Inter typography, subtle borders (`border-slate-200/80`), soft shadows (`shadow-subtle`), and moderately rounded corners (`rounded-xl`).
- **Responsive:** Full cross-device support (Desktop, Tablet, Mobile) with an off-canvas drawer navigation for mobile viewports.

---

## Getting Started

```bash
# Frontend + AI assistan
npm install
npm run dev
# Optional: paste an LLM API key in the AI Assistant page to enable online mode.
# Without one, the assistant uses the offline rule-based mode.

# Python recommendation backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Tests
npm test
```

---

##  Implemented Sections

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

## Code Architecture

```text
LunarLife/
├── src/                        
│   ├── App.tsx                 # Core state, routing, layout
│   ├── components.tsx          # Shared UI components
│   ├── types.ts, data.ts       # Types and demo data
│   ├── pages/                  # Dashboard, AI Assistant, Personal Health,
│   │                           # Predictive Analytics, Recommendations, Settings
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Connects the frontend to the engines/backend
│   ├── analytics/              # Predictive analytics logic
│   ├── assessment/             # Adaptive health assessment
│   └── assistant/              # AI assistant engine
│       ├── aiClient.ts         # LLM client
│       ├── engine.ts           # Assistant logic
│       ├── contextBuilder.ts   # Builds context from health records
│       ├── knowledgeBase.ts    # Rule-based knowledge
│       ├── redFlags.ts         # Red-flag symptom detection
│       ├── systemPrompt.ts     # LLM system prompt
│       ├── loadRecords.ts      # Loads astronaut records
│       └── scenarios.ts        # Test/demo scenarios
├── backend/                    # Python recommendation engine
│   ├── main.py
│   ├── models.py
│   ├── recommendation_engine.py
│   ├── requirements.txt
│   └── tests/
├── Datasets/
│   ├── NASA Real Data/         # NASA LSDA LSDS-8 research datasets
│   └── Simulated Datasets/     # Simulated astronaut data for the demo
├── index.html, vite.config.ts, tailwind.config.js, tsconfig.json
└── run-tests.mjs
```

---

##  Technology Stack

- **Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS, Recharts, Node.js, Python
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts
- **Iconography:** Lucide React
