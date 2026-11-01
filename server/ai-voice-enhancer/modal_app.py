"""
CompX Orbit — Serverless AI Voice Enhancer on Modal.com
Scale-to-zero serverless GPU deployment for DeepFilterNet + Resemble Enhance.
Costs $0 when idle! Only runs when a user clicks 'Enhance'.

Deployment instructions:
1. pip install modal
2. modal setup
3. modal deploy modal_app.py
"""

import modal
import os
import shutil
import tempfile
import subprocess

# Define the container image with ffmpeg, PyTorch, DeepFilterNet and Resemble Enhance
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "git", "build-essential", "libsndfile1")
    .pip_install(
        "fastapi",
        "python-multipart",
        "torch>=2.2.0",
        "torchaudio>=2.2.0",
        "deepfilternet>=0.5.6",
        "resemble-enhance>=0.0.1",
    )
)

app = modal.App("orbit-ai-voice-enhancer", image=image)


@app.function(
    gpu="T4",  # Fast & cheap GPU (or "A10G" for lightning speed)
    timeout=120,
    scaledown_window=60,  # Scale down to 0 instances after 60s of inactivity ($0 idle cost!)
)
@modal.web_endpoint(method="POST")
def process_audio(
    file: modal.FastAPIFile = None,
    mode: str = "both",
    atten_db: float = 100.0,
    denoise_strength: float = 0.8,
):
    from fastapi import HTTPException
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask

    import torch
    import torchaudio
    from df.enhance import enhance as df_enhance, init_df, load_audio, save_audio
    from resemble_enhance.enhancer.inference import enhance as resemble_enhance

    tmp = tempfile.mkdtemp()
    cleanup = BackgroundTask(shutil.rmtree, tmp, ignore_errors=True)

    try:
        raw_path = os.path.join(tmp, "raw_audio")
        with open(raw_path, "wb") as f:
            f.write(file.file.read())

        cur_wav = os.path.join(tmp, "cur.wav")
        # Convert to 48kHz mono PCM WAV
        r = subprocess.run(
            ["ffmpeg", "-y", "-i", raw_path, "-vn", "-ac", "1", "-ar", "48000", cur_wav],
            capture_output=True,
        )
        if r.returncode != 0:
            raise HTTPException(400, "Could not decode audio file with ffmpeg")

        # 1. DeepFilterNet Noise Reduction
        if mode in ("denoise", "both"):
            model, state, _ = init_df()
            audio, _ = load_audio(cur_wav, sr=state.sr())
            limit = None if atten_db >= 100 else float(atten_db)
            out = df_enhance(model, state, audio, atten_lim_db=limit)
            denoised_wav = os.path.join(tmp, "denoised.wav")
            save_audio(denoised_wav, out, state.sr())
            cur_wav = denoised_wav

        # 2. Resemble Enhance Voice Super-Resolution
        if mode in ("enhance", "both"):
            device = "cuda" if torch.cuda.is_available() else "cpu"
            wav, sr = torchaudio.load(cur_wav)
            wav = wav.mean(dim=0)
            enhanced_out, new_sr = resemble_enhance(
                wav,
                sr,
                device,
                nfe=64,
                solver="midpoint",
                lambd=float(denoise_strength),
                tau=0.5,
            )
            enhanced_wav = os.path.join(tmp, "enhanced.wav")
            torchaudio.save(enhanced_wav, enhanced_out.unsqueeze(0).cpu(), new_sr)
            cur_wav = enhanced_wav

        return FileResponse(
            cur_wav,
            media_type="audio/wav",
            filename="enhanced_studio.wav",
            background=cleanup,
        )
    except Exception as e:
        shutil.rmtree(tmp, ignore_errors=True)
        raise HTTPException(500, detail=str(e))
