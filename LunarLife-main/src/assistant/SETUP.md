# Setup

1. Copy `src/assistant/` and `src/pages/AiAssistant.tsx` into your project (replace the old AiAssistant.tsx).
2. Create `src/assistant/data/` and copy in from the ASTRA pack:
   - daily_health_monitoring.csv
   - cabin_environment_log.csv
   - health_guidance.json
3. Make sure `tsconfig.json` has `"resolveJsonModule": true` and `src/vite-env.d.ts` contains
   `/// <reference types="vite/client" />` (the default Vite template already does; it types the `?raw` import).
4. `npm run dev`. No new packages needed.

Nothing is read from .env; the optional AI key is pasted in the UI and kept in memory.
