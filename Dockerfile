# Use Python 3.11 as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 9000
# Run the app with Gunicorn
CMD ["gunicorn", "--config", "gunicorn_config.py", "app:app"]
