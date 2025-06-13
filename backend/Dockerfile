# Build dependencies
FROM python:3.11-slim AS builder
WORKDIR /install
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# Final image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
