FROM python:3.9-slim

# Install system dependencies for Manim and ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

COPY . .

# Create directories for uploads and results
RUN mkdir -p uploads results media

# Expose port
EXPOSE 5000

# Run with Gunicorn
# Run with Gunicorn, binding to the PORT environment variable (required by Railway/Render)
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --timeout 120 app:app
