"""
ai/gemini_client.py
NDURANCE AI — Google Gemini API Client
Provides AI-powered explanations, coaching messages, and session summaries.
"""
from typing import Optional, Dict, Any, List
import json
from app.config import settings


def _call_gemini(prompt: str, max_tokens: int = 1024) -> Optional[str]:
    """
    Make a single call to the Gemini API.
    Returns the text response or None if unavailable.
    """
    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[Gemini] API error: {e}")
        return None


def generate_session_summary(
    metrics: Dict[str, Any],
    activity: str,
    user_name: str = "Athlete",
    height_cm: float = 175,
    weight_kg: float = 70,
) -> str:
    """
    Generate a natural-language session summary using Gemini.
    Falls back to rule-based summary if API unavailable.
    """
    prompt = f"""
You are an expert sports biomechanics coach analyzing {user_name}'s performance session.

Athlete Profile:
- Height: {height_cm}cm, Weight: {weight_kg}kg
- Activity: {activity}

Session Metrics:
{json.dumps(metrics, indent=2)}

Write a concise (3-4 sentences) professional session summary that:
1. States the overall performance quality
2. Highlights the most important finding
3. Gives one primary actionable recommendation
Be encouraging but specific. Use professional sports science language.
"""

    result = _call_gemini(prompt, max_tokens=300)
    
    if result:
        return result
    
    # Fallback rule-based summary
    score = metrics.get("form_score", metrics.get("overall_score", 75))
    cadence = metrics.get("cadence", 0)
    
    quality = "excellent" if score >= 85 else "good" if score >= 70 else "needs improvement"
    
    return (
        f"{user_name}'s {activity} session scored {score}/100 — overall form quality is {quality}. "
        f"{'Cadence at ' + str(cadence) + ' SPM is ' + ('optimal' if cadence >= 170 else 'below optimal') + '.' if cadence > 0 else ''} "
        "Focus on the corrective exercises recommended to improve biomechanical efficiency."
    )


def generate_live_coaching_cue(
    alerts: List[Dict[str, str]],
    activity: str,
    form_score: float,
    previous_cues: List[str],
) -> Optional[str]:
    """
    Generate a single live coaching cue using Gemini.
    Returns None if no cue needed or API unavailable.
    """
    if not alerts and form_score > 90:
        return None

    if not settings.GEMINI_API_KEY:
        # Return rule-based cue from first alert
        if alerts:
            return alerts[0]["message"]
        return None

    recent_cues_str = "\n".join(f"- {c}" for c in previous_cues[-3:])
    alerts_str = "\n".join(f"- [{a['severity'].upper()}] {a['message']}" for a in alerts[:3])

    prompt = f"""
You are a real-time sports coach providing live feedback during {activity}.

Current alerts detected:
{alerts_str if alerts_str else 'None'}

Form score: {form_score}/100
Recent coaching cues given:
{recent_cues_str if recent_cues_str else 'None yet'}

Generate ONE short, direct coaching instruction (max 12 words).
- Do NOT repeat recent cues
- Be specific and actionable
- Use active present tense ("Keep", "Drive", "Straighten")
- Example: "Drive your elbows back and keep your chin up"
Only output the cue itself, nothing else.
"""
    return _call_gemini(prompt, max_tokens=50)


def generate_recommendations(
    metrics: Dict[str, Any],
    activity: str,
    issues: List[str],
) -> List[Dict[str, Any]]:
    """
    Generate personalized exercise recommendations using Gemini.
    Falls back to rule-based recommendations.
    """
    if not settings.GEMINI_API_KEY:
        return _rule_based_recommendations(metrics, activity, issues)

    issues_str = "\n".join(f"- {i}" for i in issues)
    prompt = f"""
You are a sports biomechanics expert creating a corrective exercise program.

Activity analyzed: {activity}
Issues detected:
{issues_str if issues_str else '- No major issues detected'}

Key metrics: {json.dumps({k: v for k, v in metrics.items() if isinstance(v, (int, float))}, indent=2)}

Generate exactly 3 targeted corrective exercises as a JSON array with this exact format:
[
  {{
    "title": "Exercise Name",
    "category": "strength|mobility|technique|cardio",
    "target_issue": "What issue this fixes",
    "sets_reps": "3 sets x 12 reps",
    "description": "Clear 2-sentence instruction",
    "priority": 1
  }}
]
Output ONLY the JSON array, no other text.
"""
    result = _call_gemini(prompt, max_tokens=600)
    
    if result:
        try:
            # Extract JSON from response
            start = result.find('[')
            end = result.rfind(']') + 1
            if start != -1 and end > start:
                recs = json.loads(result[start:end])
                return recs
        except json.JSONDecodeError:
            pass
    
    return _rule_based_recommendations(metrics, activity, issues)


def compare_sessions(current: Dict, previous: Dict) -> str:
    """Compare current session with previous for progress reporting."""
    if not settings.GEMINI_API_KEY:
        # Simple rule-based comparison
        curr_score = current.get("form_score", 0)
        prev_score = previous.get("form_score", 0)
        diff = curr_score - prev_score
        
        if diff > 5:
            return f"Great progress! Your form score improved by {diff:.1f} points since last session."
        elif diff > 0:
            return f"Slight improvement of {diff:.1f} points — keep working on your technique."
        elif diff < -5:
            return f"Form score dropped by {abs(diff):.1f} points — focus on the corrective exercises."
        else:
            return "Consistent performance — maintain this quality and push for improvement."

    prompt = f"""
Compare these two sports performance sessions and write a 2-sentence progress report.

Current session: {json.dumps(current, indent=2)}
Previous session: {json.dumps(previous, indent=2)}

Be specific about what improved and what needs work. End with one forward-looking recommendation.
"""
    result = _call_gemini(prompt, max_tokens=200)
    return result or "Session comparison unavailable."


def _rule_based_recommendations(
    metrics: Dict, activity: str, issues: List[str]
) -> List[Dict[str, Any]]:
    """Fallback rule-based exercise recommendations."""
    recs = []
    
    cadence = metrics.get("cadence", 180)
    vert_osc = metrics.get("vertical_oscillation_cm", 7)
    gct = metrics.get("ground_contact_time_ms", 200)
    form_score = metrics.get("form_score", 80)

    if cadence > 0 and cadence < 170:
        recs.append({
            "title": "Metronome Cadence Drills",
            "category": "technique",
            "target_issue": "Low cadence / overstriding",
            "sets_reps": "4 x 45 seconds @ 178 BPM",
            "description": "Run with a metronome app set to 178 BPM. Focus on rapid foot turnover with shorter, quicker strides. Keep arms relaxed at 90°.",
            "priority": 1,
        })

    if vert_osc > 8.5:
        recs.append({
            "title": "Horizontal Drive Runs",
            "category": "technique",
            "target_issue": "Excessive vertical oscillation",
            "sets_reps": "3 x 60 seconds",
            "description": "Visualize running under a low ceiling. Push energy horizontally rather than upward. Engage your glutes for forward propulsion.",
            "priority": 1,
        })

    if gct > 225:
        recs.append({
            "title": "Ankle Pogo Jumps",
            "category": "strength",
            "target_issue": "Prolonged ground contact time",
            "sets_reps": "3 x 20 jumps",
            "description": "Bounce on balls of feet with stiff ankles, minimizing contact time. Think of your feet as springs — quick elastic rebound.",
            "priority": 2,
        })

    # Always include a core stability drill
    recs.append({
        "title": "Single-Leg Glute Bridge",
        "category": "strength",
        "target_issue": "Hip stability and glute drive",
        "sets_reps": "3 x 12 reps per leg",
        "description": "Drive through heel to full hip extension, hold 2 seconds at top. Builds glute max power for explosive push-off phase.",
        "priority": 2,
    })

    if "squat" in activity.lower():
        recs.append({
            "title": "Goblet Squat Holds",
            "category": "mobility",
            "target_issue": "Squat depth and form",
            "sets_reps": "3 x 10 reps + 30s hold at bottom",
            "description": "Hold a weight at chest, squat to full depth and hold position. Improves ankle mobility and reinforces upright torso position.",
            "priority": 1,
        })

    return recs[:4]  # Return max 4 recommendations
