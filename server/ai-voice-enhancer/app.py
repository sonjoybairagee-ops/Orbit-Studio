import os
import subprocess
import tempfile
import threading
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask

app = FastAPI(
    title="CompX Orbit AI Voice Enhancer & Noise Reducer",
    description="Dual-engine AI audio enhancement with DeepFilterNet and Resemble Enhance",
    version="1.0.0",
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

lock = threading.Lock()  # Process one job at a time to optimize GPU/VRAM usage
_df = None


def to_wav(src: str, dst: str, sr: int = 48000):
    """Convert any input audio/video to uncompressed PCM WAV using ffmpeg"""
    r = subprocess.run(
        ["ffmpeg", "-y", "-i", src, "-vn", "-ac", "1", "-ar", str(sr), dst],
        capture_output=True,
    )
    if r.returncode != 0:
        raise HTTPException(status_code=400, detail="Could not decode media file with ffmpeg")


def deepfilter(in_wav: str, out_wav: str, atten_db: float):
    """Deep noise reduction using DeepFilterNet neural model"""
    global _df
    from df.enhance import enhance, init_df, load_audio, save_audio

    if _df is None:
        _df = init_df()
    model, state, _ = _df
    audio, _ = load_audio(in_wav, sr=state.sr())
    limit = None if atten_db >= 100 else float(atten_db)
    out = enhance(model, state, audio, atten_lim_db=limit)
    save_audio(out_wav, out, state.sr())


def resemble(in_wav: str, out_wav: str, denoise_strength: float):
    """Deep voice reconstruction & super-resolution using Resemble Enhance (44.1kHz output)"""
    import torch
    import torchaudio
    from resemble_enhance.enhancer.inference import enhance

    device = "cuda" if torch.cuda.is_available() else "cpu"
    wav, sr = torchaudio.load(in_wav)
    wav = wav.mean(dim=0)
    out, new_sr = enhance(
        wav,
        sr,
        device,
        nfe=64,
        solver="midpoint",
        lambd=float(denoise_strength),  # 0..1 denoise strength
        tau=0.5,
    )
    torchaudio.save(out_wav, out.unsqueeze(0).cpu(), new_sr)


@app.get("/health")
def health():
    """Health check endpoint to verify AI service status & GPU availability"""
    gpu_available = False
    gpu_name = None
    try:
        import torch
        gpu_available = torch.cuda.is_available()
        if gpu_available:
            gpu_name = torch.cuda.get_device_name(0)
    except Exception:
        pass

    return {
        "status": "online",
        "service": "CompX Orbit AI Voice Enhancer",
        "gpu_available": gpu_available,
        "gpu_name": gpu_name,
        "models": ["DeepFilterNet", "Resemble Enhance"],
    }


@app.post("/process")
def process(
    file: UploadFile = File(...),
    mode: str = Form("both"),  # "both" | "denoise" | "enhance"
    atten_db: float = Form(100.0),  # DeepFilterNet: 6..100 (100 = full attenuation)
    denoise_strength: float = Form(0.8),  # Resemble: 0..1
):
    if mode not in ("denoise", "enhance", "both"):
        raise HTTPException(status_code=400, detail="Mode must be 'denoise', 'enhance', or 'both'")

    tmp = tempfile.mkdtemp()
    cleanup = BackgroundTask(shutil.rmtree, tmp, ignore_errors=True)

    try:
        raw = os.path.join(tmp, "raw_" + os.path.basename(file.filename or "input_audio"))
        with open(raw, "wb") as f:
            shutil.copyfileobj(file.file, f)

        cur = os.path.join(tmp, "cur.wav")
        to_wav(raw, cur, 48000)

        with lock:
            # Stage 1: DeepFilterNet (Eradicates background noise, fan hum, AC whirr)
            if mode in ("denoise", "both"):
                nxt = os.path.join(tmp, "denoised.wav")
                deepfilter(cur, nxt, atten_db)
                cur = nxt

            # Stage 2: Resemble Enhance (Reconstructs lost voice frequencies, adds studio warmth & clarity)
            if mode in ("enhance", "both"):
                nxt = os.path.join(tmp, "enhanced.wav")
                resemble(cur, nxt, denoise_strength)
                cur = nxt

        return FileResponse(
            cur,
            media_type="audio/wav",
            filename=f"enhanced_{os.path.splitext(file.filename or 'audio')[0]}.wav",
            background=cleanup,
        )
    except Exception as e:
        shutil.rmtree(tmp, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
