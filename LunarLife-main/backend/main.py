import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from models import HealthInput, TaskUpdate
from recommendation_engine import generate

app = FastAPI(title='LunarLife Health Recommendations API', version='1.0.0')
DB_PATH = Path(os.environ.get('LUNARLIFE_DB_PATH', str(Path(__file__).parent / 'recommendations.db')))

@contextmanager
def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        con.execute('CREATE TABLE IF NOT EXISTS recommendations (id TEXT PRIMARY KEY, astronaut_id TEXT NOT NULL, payload TEXT NOT NULL)')
        con.execute('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, astronaut_id TEXT NOT NULL, title TEXT NOT NULL, reason TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL)')
        yield con
        con.commit()
    finally:
        con.close()

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/recommendations/generate')
def create_recommendations(data: HealthInput):
    result = generate(data)
    with db() as con:
        con.execute('INSERT INTO recommendations VALUES (?, ?, ?)', (str(uuid4()), data.astronaut_id, json.dumps(result['recommendations'])))
        saved = []
        for task in result['follow_up_tasks']:
            task_id = str(uuid4())
            con.execute('INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?)',
                        (task_id, data.astronaut_id, task['title'], task['reason'], task['priority'], task['status'], task['due']))
            saved.append({'id': task_id, **task})
    return {**result, 'follow_up_tasks': saved}

@app.get('/recommendations/{astronaut_id}')
def get_recommendations(astronaut_id: str):
    with db() as con:
        rows = con.execute('SELECT payload FROM recommendations WHERE astronaut_id=? ORDER BY rowid DESC LIMIT 1', (astronaut_id,)).fetchall()
    return {'astronaut_id': astronaut_id, 'recommendations': json.loads(rows[0]['payload']) if rows else []}

@app.get('/tasks/{astronaut_id}')
def get_tasks(astronaut_id: str):
    with db() as con:
        rows = con.execute('SELECT * FROM tasks WHERE astronaut_id=? ORDER BY rowid DESC', (astronaut_id,)).fetchall()
    return {'astronaut_id': astronaut_id, 'tasks': [dict(row) for row in rows]}

@app.patch('/tasks/{task_id}')
def update_task(task_id: str, change: TaskUpdate):
    with db() as con:
        cursor = con.execute('UPDATE tasks SET status=? WHERE id=?', (change.status, task_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Task not found')
        row = con.execute('SELECT * FROM tasks WHERE id=?', (task_id,)).fetchone()
    return dict(row)
