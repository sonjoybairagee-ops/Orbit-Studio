# CompX Orbit AI Voice Enhancer (DeepFilterNet + Resemble Enhance)

This AI microservice runs real-time deep neural voice enhancement and noise eradication, identical to **Adobe Podcast AI ("Project Shasta")**.

---

## 🚀 Option 1: Free Cloud Deployment on Hugging Face Spaces (Recommended — 0$ Cost)

1. Create a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space** -> Choose **Docker** -> Select **Blank**.
3. Clone or upload the 3 files from this folder (`app.py`, `requirements.txt`, `Dockerfile`).
4. Hugging Face will build the container in 2 minutes and give you a public URL (e.g., `https://username-orbit-ai-voice.hf.space`).
5. In your Next.js project settings (or `.env.local`), add:
   ```env
   AI_VOICE_ENHANCE_URL=https://username-orbit-ai-voice.hf.space
   ```
6. Done! `compxorbit.com` now uses deep neural AI for voice enhancement!

---

## 💻 Option 2: Run Locally on your PC

### Prerequisites
- Python 3.10+
- FFmpeg installed in your PATH
- (Optional but recommended): NVIDIA GPU with CUDA for <3s processing

### Run commands:
```bash
cd server/ai-voice-enhancer
pip install -r requirements.txt
python app.py
```
The server will start at `http://localhost:7860`.

In Next.js `.env.local`:
```env
AI_VOICE_ENHANCE_URL=http://localhost:7860
```
