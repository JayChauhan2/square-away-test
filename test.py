from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

with open('image.png', 'rb') as f:
    image_bytes = f.read()

client = genai.Client(api_key=API_KEY)

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        types.Part.from_bytes(
            data=image_bytes,
            mime_type='image/jpeg',
        ),
        'Caption this image.'
    ]
)

print(response.text)
