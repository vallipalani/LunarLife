import os
import tempfile
from pathlib import Path

os.environ['LUNARLIFE_DB_PATH'] = str(Path(tempfile.mkdtemp()) / 'test.db')
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_sleep_stress_and_tasks():
    response = client.post('/recommendations/generate', json={
        'astronaut_id': 'AST-001', 'sleep_hours': 5.2,
        'baseline_sleep_hours': 7.5, 'stress_level': 8})
    assert response.status_code == 200
    body = response.json()
    assert {r['category'] for r in body['recommendations']} == {'sleep', 'stress'}
    task_id = body['follow_up_tasks'][0]['id']
    assert client.patch(f'/tasks/{task_id}', json={'status': 'completed'}).json()['status'] == 'completed'
    assert len(client.get('/tasks/AST-001').json()['tasks']) == 2
    assert len(client.get('/recommendations/AST-001').json()['recommendations']) == 2

def test_safety_blocks_activity_increase():
    body = client.post('/recommendations/generate', json={
        'astronaut_id': 'AST-002', 'activity_status': 'low', 'dizziness': True}).json()
    assert any(r['category'] == 'medical_review' for r in body['recommendations'])
    assert any(r['title'] == 'Defer exercise changes' for r in body['recommendations'])

def test_chest_pain_escalates():
    body = client.post('/recommendations/generate', json={
        'astronaut_id': 'AST-003', 'chest_pain': True}).json()
    assert any(r['priority'] == 'urgent' for r in body['recommendations'])

def test_invalid_input_and_missing_task():
    assert client.post('/recommendations/generate', json={
        'astronaut_id': 'AST-004', 'stress_level': 99}).status_code == 422
    assert client.patch('/tasks/missing', json={'status': 'completed'}).status_code == 404

def test_predictive_finding():
    body = client.post('/recommendations/generate', json={
        'astronaut_id': 'AST-005', 'findings': [{'code': 'sleep_decline'}]}).json()
    assert any(r['category'] == 'sleep' for r in body['recommendations'])
