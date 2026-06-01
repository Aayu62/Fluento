"""
AI Server — Whisper STT + Piper TTS
Implemented in Phase 13 (AI Integration).
This is the scaffold entry point.
"""
from fastapi import FastAPI

app = FastAPI(title="Fluento AI Server", version="1.0.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
