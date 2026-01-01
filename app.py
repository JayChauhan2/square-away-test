from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
from google import genai
from google.genai import types
from pathlib import Path
import subprocess
import os
import json
import requests
import mimetypes
import shutil
import threading
from dotenv import load_dotenv
from gtts import gTTS

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

def clear_folder(folder_path):
    """Delete all files in a folder but keep the folder itself."""
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)


@app.route('/chatbot', methods=['POST'])
def chatbot():
    """
    Receives:
      - notes: The converted notes text
      - user_message: The user's question
      - chat_history: optional list of previous messages [{role, content}]
    Returns:
      - chatbot response
    """
    data = request.json
    notes = data.get("notes", "")
    user_message = data.get("user_message", "")
    chat_history = data.get("chat_history", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Build conversation
    conversation = [{"role": "system", "content": (
        "You are a helpful study assistant. "
        "Keep your answers concise for chat display, "
        "wrap all formulas in LaTeX (use $...$ for inline math), "
        "and do not write huge paragraphs."
    )}]
    
    # Add previous chat messages if any
    conversation.extend(chat_history)
    
    # Add current user message
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


@app.route('/leave-class', methods=['POST'])
def leave_class():
    data = request.json
    student_id = data.get('student_id')
    class_id = data.get('class_id')

    if not student_id or not class_id:
        return jsonify({"error": "Missing student_id or class_id"}), 400

    supabase_url = os.getenv("SUPABASE_URL")
    # Try service role key first, fallback to standard key (might fail if RLS blocks it)
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        return jsonify({"error": "Server misconfiguration: Missing Supabase keys"}), 500

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # PostgREST Delete
    url = f"{supabase_url}/rest/v1/class_enrollments?student_id=eq.{student_id}&class_id=eq.{class_id}"
    
    response = requests.delete(url, headers=headers)

    if response.status_code >= 200 and response.status_code < 300:
        return jsonify({"message": "Successfully left class", "details": response.json() if response.content else {}})
    else:
        return jsonify({"error": "Failed to leave class", "details": response.text}), response.status_code

@app.route('/create-questions', methods=['POST'])
def create_questions():
    # Get topic and parameters from request body
    data = request.get_json()
    topic = data.get("topic")
    # Default to 5 if not provided, for normal practice
    count = data.get("count", 5)
    # Default to all if not provided
    question_types = data.get("types", []) 
    
    # Map friendly names to internals if needed, or just pass strings
    # The prompt expects: "multiple-choice, true/false, short answer/free response, and word problems"
    # If types are provided, format them for the prompt.
    types_str = "multiple-choice, true/false, short answer/free response, and word problems"
    if question_types:
        types_str = ", ".join(question_types)

    with open("./src/assets/question_create_prompt.txt", "r") as file:
        content = file.read()
    
    # ------------------------------------------------------------------
    # DYNAMIC PROMPT INJECTION
    # ------------------------------------------------------------------
    # Replace lines in the text file with our custom constraints
    # Valid types line: "The ONLY 4 types of problems you can ask the user are: ..."
    content = content.replace(
        "The ONLY 4 types of problems you can ask the user are: multiple-choice, true/false, short answer/free response, and word problems.",
        f"The ONLY types of problems you can ask the user are: {types_str}."
    )
    
    # Count line: "ONLY ask the user 5 questions."
    content = content.replace(
        "ONLY ask the user 5 questions. No more, no less.",
        f"ONLY ask the user {count} questions. No more, no less."
    )
    # ------------------------------------------------------------------

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
                "content": content + topic
            }
            ]
        })
    )
    data = response.json()

    # # Extract the assistant message content
    raw_output = data["choices"][0]["message"]["content"]

    print("raw_output: " + raw_output)

    lines = raw_output.strip().split("\n")
    # Remove first and last lines (backticks)
    lines = raw_output.strip().split("\n")
    if len(lines) > 2:
        middle = "\n".join(lines[1:-1])
    else:
        middle = raw_output  # fallback if no extra lines

    # Attempt to parse JSON safely
    try:
        questions_json = json.loads(middle)
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        return jsonify({"error": "Failed to parse questions JSON", "raw": middle}), 500

    print(middle)
    # Return JSON directly
    return jsonify(questions_json)

def generate_title(text):
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
            "content": '''Carefully review the text provided and generate a viable TITLE for the topic that the content is on. The content should be 10-12 words MAXIMUM, it can be shorter as needed.
                Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the title.''' + text
        }
        ]
    })
    )
    data = response.json()

    # # Extract the assistant message content
    llm_output = data["choices"][0]["message"]["content"]

    return llm_output

def convert_to_latex(text):
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
            "content": '''Convert the text below into a LaTeX document.
                After converting, carefully review the text and correct any mistakes
                or misread characters. Preserve formatting like bullet points,
                headings, or mathematical notation where possible.
                Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the extracted LaTeX output.''' + text
        }
        ]
    })
    )
    data = response.json()

    # # Extract the assistant message content
    llm_output = data["choices"][0]["message"]["content"]

    return llm_output
    
@app.route('/extract-text', methods=['POST'])
def extractText():
    # 1. Clear uploads and results folders
    clear_folder(UPLOAD_FOLDER)
    clear_folder(RESULTS_FOLDER)

    # --- 1. Handle multiple uploaded images ---
    uploaded_files = request.files.getlist('images')

    if not uploaded_files or uploaded_files == [None]:
        return jsonify({"error": "No images uploaded"}), 400

    for file in uploaded_files:
        if file.filename == "":
            continue
        
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        print(f"Saved uploaded image: {save_path}")

    API_KEY = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=API_KEY)

    extracted_text = ""
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Skip directories
        if not os.path.isfile(file_path):
            continue

        mime_type, _ = mimetypes.guess_type(file_path)

        # Accept only JPEG/PNG images
        if mime_type not in ("image/jpeg", "image/png"):
            print(f"Skipping non-image file: {filename}")
            continue

        print(f"\nProcessing image: {filename}")

        with open(file_path, 'rb') as f:
            image_bytes = f.read()

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                (
                    "Extract all the text from this image and "
                    "After extracting, carefully review the text and correct any mistakes "
                    "or misread characters. THEN, CONVERT the text into a neatly formatted notes with logical understanding."
                    " Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the neatly formatted output."
                )
            ]
        )
        extracted_text += response.text + "\n"
    
    # Save to file
    results_file_path = os.path.join(RESULTS_FOLDER, "results.txt")
    with open(results_file_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)

    print(f"\nAll results saved to {results_file_path}")
    
    #generate a title and return that too
    notes_title = generate_title(extracted_text)

    # Return the extracted text in the response
    return jsonify({
        "status": "success",
        "extracted_text": extracted_text,
        "notes_title" : notes_title,
    })

def background_video_creation(user_text):
    try:
        # Correct path where Manim saves the output
        video_path = Path("media/videos/generated_manim_script/1080p60/Explainer.mp4")
        if video_path.exists():
            video_path.unlink()
            print(f"Deleted old video at: {video_path}")
        else:
            print("No old video to delete.")
        createVideo(user_text)
        print("Video generation finished!")
    except Exception as e:
        print("Error generating video:", e)
    
@app.route('/generate-video', methods=['POST'])
def generate_video():
    data = request.json
    user_text = data.get('text', '')
    if not user_text:
        return jsonify({"error": "No text provided"}), 400
    
    # Start the video generation in a separate thread
    thread = threading.Thread(target=background_video_creation, args=(user_text,))
    thread.start()
    
    # Immediately respond to the client
    return jsonify({"status": "started"})

@app.route('/video', methods=['GET'])
def get_video():
    """Serve the generated video file"""
    video_path = Path("media/videos/generated_manim_script/1080p60/Explainer.mp4")
    
    if not video_path.exists():
        return jsonify({"error": "Video not found"}), 404
    
    return send_file(
        video_path,
        mimetype='video/mp4',
        as_attachment=False,
        download_name='Explainer.mp4'
    )

def createVideo(user_text_here):
    with open("./src/assets/video_prompt.txt", "r") as file:
        content = file.read()
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
            "content": content + convert_to_latex(user_text_here)
        }
        ]
    })
    )
    data = response.json()

    print("API Response:", json.dumps(data, indent=2))

    if "error" in data:
        raise ValueError(f"API Error: {data['error']}")

    if "choices" not in data:
        raise ValueError(f"Unexpected API response format: {data}")

    llm_output = data["choices"][0]["message"]["content"]

    # 1. Parse Voiceover
    if "VOICEOVER_SCRIPT" in llm_output and "END_VOICEOVER" in llm_output:
        try:
            voice_part = llm_output.split("VOICEOVER_SCRIPT", 1)[1]
            voice_text = voice_part.split("END_VOICEOVER", 1)[0].strip()
            
            # Generate MP3 using gTTS
            print(f"Generating voiceover ({len(voice_text)} chars) with gTTS...")
            
            # Generate base audio with gTTS
            tts = gTTS(text=voice_text, lang='en', slow=False)
            tts.save('voiceover_temp.mp3')
            
            # Speed up audio to 1.5x using ffmpeg
            subprocess.run([
                'ffmpeg', '-y', '-i', 'voiceover_temp.mp3',
                '-filter:a', 'atempo=1.5',
                'voiceover.mp3'
            ], check=True, capture_output=True)
            
            # Clean up temp file
            if os.path.exists('voiceover_temp.mp3'):
                os.remove('voiceover_temp.mp3')
            
            # Verify file exists and has content
            if os.path.exists("voiceover.mp3") and os.path.getsize("voiceover.mp3") > 0:
                 print(f"voiceover.mp3 saved successfully. Size: {os.path.getsize('voiceover.mp3')} bytes")
            else:
                 print("Error: voiceover.mp3 is empty or missing.")

        except Exception as e:
            print(f"Error generating voiceover: {e}")
    else:
        print("No VOICEOVER_SCRIPT found in LLM output.")

    if "Manim" not in llm_output:
        raise ValueError("LLM did not return a valid script with 'Manim' marker.")

    script_text = llm_output.split("Manim", 1)[1].strip()

    # Remove code fences (``` or ```python)
    if script_text.startswith("```"):
        # Split by newline after the first ``` line
        lines = script_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]  # remove opening ```
        if lines[-1].startswith("```"):
            lines = lines[:-1]  # remove closing ```
        script_text = "\n".join(lines).strip()

    # -------------------------------------------------------------
    # 2. Use a fixed script name — delete if it already exists
    # -------------------------------------------------------------
    script_name = "generated_manim_script.py"
    script_path = Path(script_name)

    if script_path.exists():
        script_path.unlink()  # delete old file

    # Write new script
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_text)

    project_root = Path(__file__).parent
    # venv_python = project_root / ".venv" / "bin" / "python"
    venv_manim  = project_root / ".venv" / "bin" / "manim"

    if not venv_manim.exists():
        raise RuntimeError("Manim is not installed inside .venv.")

    subprocess.run(
        [
            str(venv_manim),
            "-qh",
            script_name,
            "Explainer"
        ],
        cwd=project_root,
        check=True
    )
    print("==== Extracted Script Start ====")
    print(script_text[:200])  # first 200 chars
    print("==== Extracted Script End ====")

     #return llm_output


@app.route('/evaluate-answer', methods=['POST'])
def evaluate_answer():
    data = request.json
    question_text = data.get('question', '')
    user_answer = data.get('user_answer', '')
    correct_answer = data.get('correct_answer', '') # Optional, if available

    if not question_text or not user_answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = (
        "You are an expert teacher grading a student's answer.\n"
        f"Question: {question_text}\n"
        f"Student Answer: {user_answer}\n"
        f"Target Concept/Answer: {correct_answer}\n\n"
        "Task:\n"
        "1. Determine if the student's answer is essentially correct based on the target concept. Be generous with phrasing but strict on facts.\n"
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
        print(f"Error evaluating answer: {e}")
        # Fallback to simple containment check if AI fails
        is_correct = correct_answer.lower() in user_answer.lower() if correct_answer else False
        return jsonify({"correct": is_correct, "feedback": "AI evaluation failed, falling back to simple check."})

@app.route('/save-changed-notes', methods=['POST'])
def save_changed_notes():
    """Save edited notes content back to file"""
    try:
        data = request.json
        content = data.get('changedNotes')
        filename = data.get('filename', 'results.txt')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        filepath = os.path.join(RESULTS_FOLDER, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Saved content to {filepath}")
        return jsonify({'success': True, 'message': 'Content saved successfully'}), 200
    
    except Exception as e:
        print(f"Error in save-changed-notes: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/get-users', methods=['GET'])
def get_users():
    """
    Fetches all users from Supabase Auth Admin API.
    Requires SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY (if it has admin rights) in .env.
    Returns:
        JSON list of users: { id, email, name }
    """
    print("--- /get-users called ---")
    try:
        # Prefer SERVICE_ROLE_KEY for admin tasks, fallback to standard KEY
        supabase_url = os.getenv("SUPABASE_URL")
        
        service_role_key_env = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        anon_key_env = os.getenv("SUPABASE_KEY")
        
        # Ensure your .env has SUPABASE_SERVICE_ROLE_KEY for this to work
        service_key = service_role_key_env or anon_key_env

        print(f"Supabase URL found: {bool(supabase_url)}")
        print(f"Has SUPABASE_SERVICE_ROLE_KEY: {bool(service_role_key_env)}")
        print(f"Has SUPABASE_KEY: {bool(anon_key_env)}")
        print(f"Using Key: {'Service Role Key' if service_role_key_env else 'Anon Key (Likely Insufficient)'}")

        if not supabase_url or not service_key:
            print("Error: Missing keys")
            return jsonify({"error": "Missing Supabase configuration in .env"}), 500

        # Construct the Admin API URL
        # Docs: https://supabase.com/docs/reference/api/auth-admin-list-users
        admin_url = f"{supabase_url}/auth/v1/admin/users"
        
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        }

        users = []
        page = 1
        per_page = 50 # Default page size

        while True:
            print(f"Fetching page {page}...")
            response = requests.get(
                f"{admin_url}?page={page}&per_page={per_page}",
                headers=headers
            )

            print(f"Supabase Response Status: {response.status_code}")
            if response.status_code != 200:
                print(f"Failed to fetch users: {response.text}")
                return jsonify({"error": "Failed to fetch users from Supabase"}), 500

            data = response.json()
            users_page = data.get("users", [])
            print(f"Users found in page: {len(users_page)}")
            
            if not users_page:
                break
                
            users.extend(users_page)
            page += 1

        print(f"Total users fetched: {len(users)}")

        # Format for frontend
        formatted_users = []
        for u in users:
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
        print(f"Error in /get-users: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)