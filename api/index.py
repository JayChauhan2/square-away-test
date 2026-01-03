from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    notes = data.get("notes", "")
    user_message = data.get("user_message", "")
    chat_history = data.get("chat_history", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    conversation = [{"role": "system", "content": (
        "You are a helpful study assistant. "
        "Keep your answers concise for chat display, "
        "wrap all formulas in LaTeX (use $...$ for inline math), "
        "and do not write huge paragraphs."
    )}]
    
    conversation.extend(chat_history)
    conversation.append({"role": "user", "content": f"{user_message}\n\nNotes:\n{notes}"})

    model_api_key = os.getenv("MISTRAL_API_KEY")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "mistralai/devstral-2512:free",
            "messages": conversation
        })
    )
    if response.status_code != 200:
        return jsonify({"error": "Chatbot API failed"}), 500

    data = response.json()
    answer = data["choices"][0]["message"]["content"]

    return jsonify({"answer": answer})

@app.route('/api/leave-class', methods=['POST'])
def leave_class():
    data = request.json
    student_id = data.get('student_id')
    class_id = data.get('class_id')

    if not student_id or not class_id:
        return jsonify({"error": "Missing student_id or class_id"}), 400

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        return jsonify({"error": "Server misconfiguration: Missing Supabase keys"}), 500

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    url = f"{supabase_url}/rest/v1/class_enrollments?student_id=eq.{student_id}&class_id=eq.{class_id}"
    
    response = requests.delete(url, headers=headers)

    if response.status_code >= 200 and response.status_code < 300:
        return jsonify({"message": "Successfully left class", "details": response.json() if response.content else {}})
    else:
        return jsonify({"error": "Failed to leave class", "details": response.text}), response.status_code

@app.route('/api/create-questions', methods=['POST'])
def create_questions():
    data = request.get_json()
    topic = data.get("topic")
    count = data.get("count", 5)
    question_types = data.get("types", []) 
    
    types_str = "multiple-choice, true/false, short answer/free response, and word problems"
    if question_types:
        types_str = ", ".join(question_types)

    # Use a simpler prompt string instead of reading a file for Vercel simplicity
    content = f"""You are an expert teacher who creates practice questions for students.
Your task is to create a JSON object containing a list of {count} practice questions about the topic provided by the user.

The ONLY types of problems you can ask the user are: {types_str}.

Output ONLY raw JSON. No markdown code fences. No extra text.
The JSON structure must be:
{{
  "questions": [
    {{
      "type": "multiple-choice" | "true-false" | "short-answer" | "word-problem",
      "question": "The question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for multiple-choice
      "answer": "The correct answer string"
    }}
  ]
}}

Ensure questions are high-quality, clear, and relevant to the topic.
"""
    
    model_api_key = os.getenv("MISTRAL_API_KEY")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "mistralai/devstral-2512:free",
            "messages": [
            {
                "role": "user",
                "content": content + "\n\nTopic: " + topic
            }
            ]
        })
    )
    data = response.json()
    raw_output = data["choices"][0]["message"]["content"]
    
    lines = raw_output.strip().split("\n")
    if len(lines) > 2 and lines[0].startswith("```") and lines[-1].startswith("```"):
         middle = "\n".join(lines[1:-1])
    else:
         middle = raw_output.replace("```json", "").replace("```", "")

    try:
        questions_json = json.loads(middle)
    except json.JSONDecodeError as e:
        return jsonify({"error": "Failed to parse questions JSON", "raw": middle}), 500

    return jsonify(questions_json)

@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    data = request.json
    question_text = data.get('question', '')
    user_answer = data.get('user_answer', '')
    correct_answer = data.get('correct_answer', '')

    if not question_text or not user_answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = (
        "You are an expert teacher grading a student's answer.\n"
        f"Question: {question_text}\n"
        f"Student Answer: {user_answer}\n"
        f"Target Concept/Answer: {correct_answer}\n\n"
        "Task:\n"
        "1. Determine if the student's answer is essentially correct. Be generous with phrasing but strict on facts.\n"
        "2. Provide short, constructive feedback (max 2 sentences).\n\n"
        "Output JSON ONLY:\n"
        "{ \"correct\": boolean, \"feedback\": \"string\" }"
    )

    model_api_key = os.getenv("MISTRAL_API_KEY")
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {model_api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "mistralai/devstral-2512:free",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            })
        )
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        result = json.loads(content)
        return jsonify(result)
    except Exception as e:
        is_correct = correct_answer.lower() in user_answer.lower() if correct_answer else False
        return jsonify({"correct": is_correct, "feedback": "AI evaluation failed, falling back to simple check."})

@app.route('/api/get-users', methods=['GET'])
def get_users():
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        
        service_role_key_env = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        anon_key_env = os.getenv("SUPABASE_KEY")
        service_key = service_role_key_env or anon_key_env

        if not supabase_url or not service_key:
            return jsonify({"error": "Missing Supabase configuration in .env"}), 500

        admin_url = f"{supabase_url}/auth/v1/admin/users"
        
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        }

        # Fetch first page only for simplicity in serverless (avoid timeouts)
        response = requests.get(
            f"{admin_url}?page=1&per_page=100",
            headers=headers
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch users from Supabase"}), 500

        data = response.json()
        users_page = data.get("users", [])
        
        formatted_users = []
        for u in users_page:
            uid = u.get("id")
            email = u.get("email")
            meta = u.get("user_metadata", {})
            name = meta.get("full_name") or meta.get("name") or "Student"
            
            formatted_users.append({
                "id": uid,
                "email": email,
                "name": name
            })

        return jsonify(formatted_users)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
