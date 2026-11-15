from models import HealthInput

# Demo-only heuristics. Not clinically validated thresholds or autonomous medical advice.
def generate(data: HealthInput) -> dict:
    recs, tasks = [], []
    codes = {finding.code for finding in data.findings}

    def add(category, title, description, priority, task_title):
        recs.append({'category': category, 'title': title,
                     'description': description, 'priority': priority})
        tasks.append({'title': task_title, 'reason': title,
                      'priority': priority, 'status': 'pending', 'due': 'next_check_in'})

    urgent = data.chest_pain
    review = urgent or data.dizziness or data.unusual_heart_rate or 'unusual_heart_rate' in codes
    if urgent:
        add('medical_review', 'Urgent medical review',
            'Report chest pain immediately using the mission emergency medical protocol. Do not exercise.',
            'urgent', 'Contact mission medical support immediately')
    elif review:
        add('medical_review', 'Medical assessment recommended',
            'Report dizziness or unusual heart-rate findings to mission medical personnel. Avoid increasing exercise until cleared.',
            'attention', 'Contact mission medical support')

    sleep_decline = ('sleep_decline' in codes or
        (data.sleep_hours is not None and data.baseline_sleep_hours is not None and
         data.sleep_hours < data.baseline_sleep_hours - 1))
    if sleep_decline:
        add('sleep', 'Review sleep consistency',
            'Review the approved sleep schedule and record sleep duration and quality after the next rest period.',
            'attention', 'Record sleep duration and quality')

    if data.stress_level is not None and data.stress_level >= 7 or 'stress_increase' in codes:
        add('stress', 'Stress and mood check-in',
            'Consider an approved relaxation activity and contact mission support if distress persists.',
            'attention', 'Complete mood and stress check-in')

    if data.fatigue or 'persistent_fatigue' in codes:
        add('preventive', 'Review persistent fatigue',
            'Record fatigue and discuss persistent or worsening symptoms with mission medical personnel.',
            'attention', 'Record fatigue and request medical review if persistent')

    if data.activity_status == 'low' or 'activity_decline' in codes:
        if review or data.fatigue or 'persistent_fatigue' in codes:
            add('exercise', 'Defer exercise changes',
                'Do not increase exercise intensity; seek clearance under the approved mission protocol.',
                'attention', 'Review exercise plan with mission medical support')
        else:
            add('exercise', 'Review approved activity plan',
                'Check the scheduled mission-approved exercise routine; do not change intensity without approval.',
                'routine', 'Review the next approved exercise session')

    if not recs:
        add('preventive', 'Continue routine monitoring',
            'No demonstration rules were triggered. Continue scheduled health check-ins.',
            'routine', 'Complete routine health check-in')

    return {'astronaut_id': data.astronaut_id, 'recommendations': recs,
            'follow_up_tasks': tasks, 'demo_only': True,
            'disclaimer': 'Prototype guidance only; not a diagnosis or substitute for mission medical protocols.'}
