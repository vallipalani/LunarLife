# LunarLife Health Recommendations backend

FastAPI demonstration module for personalised health recommendations and follow-up tasks. Rule-based; **not clinically validated or an AI model**. Never use for real medical decisions.

## Windows PowerShell setup

From `LunarLife/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Visit http://127.0.0.1:8000/docs

In a second PowerShell window, run:

```powershell
cd "$HOME\LunarLife\backend"
.\.venv\Scripts\python.exe -m pytest -q
```

## API

- `POST /recommendations/generate`: health measurements and optional predictive findings -> recommendations + persisted tasks
- `GET /recommendations/{astronaut_id}`: latest recommendation batch
- `GET /tasks/{astronaut_id}`: tasks and statuses
- `PATCH /tasks/{task_id}`: `{"status":"completed"}` or `{"status":"pending"}`
- `GET /health`: service status

Example POST JSON:

```json
{
  "astronaut_id": "AST-024",
  "sleep_hours": 5.2,
  "baseline_sleep_hours": 7.5,
  "stress_level": 8,
  "activity_status": "low",
  "findings": [{"code": "sleep_decline", "detail": "Declining sleep over 7 days"}]
}
```

Data is saved to a local SQLite file `recommendations.db` (override with `LUNARLIFE_DB_PATH`). It is a demo-only persistence layer; production integration requires authentication, authorisation, approved medical protocols, audit logging, and privacy controls. Due dates are symbolic (`next_check_in`) until mission scheduling is integrated. Generated tasks are appended per request; implement deduplication before production use. Do not commit the database or patient data.
