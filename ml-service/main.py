from fastapi import FastAPI, UploadFile
from PIL import Image
import io
import torch
import numpy as np

from models import clip_model, clip_preprocess, blip_processor, blip_model, namer, device
from schemas import EmbeddingResponse, NamingRequest, NamingResponse

app = FastAPI()


@app.post("/embed", response_model=EmbeddingResponse)
async def embed_image(file: UploadFile):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    image_input = clip_preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        features = clip_model.encode_image(image_input)

    embedding = features.cpu().numpy().flatten()
    embedding = embedding / np.linalg.norm(embedding)  # normalize, same as before

    return EmbeddingResponse(embedding=embedding.tolist())


@app.post("/caption", response_model=NamingResponse)
async def caption_image(file: UploadFile):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    inputs = blip_processor(image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = blip_model.generate(**inputs, max_new_tokens=50, min_new_tokens=10, num_beams=5)
    caption = blip_processor.decode(out[0], skip_special_tokens=True)

    return NamingResponse(name=caption)


@app.post("/name-board", response_model=NamingResponse)
async def name_board(request: NamingRequest):
    caption_list = "\n".join(f"- {c}" for c in request.captions)
    prompt = f"""These are photos grouped together because they look visually similar. Here's what's in each:

{caption_list}

Task: Find the ONE common theme across all these photos (ignore specific objects, focus on the overall feeling, setting, or time-of-day).
Then create a short, evocative 2-3 word name for that theme, in the style of a mood board title.

Good examples: "Golden Hours", "Quiet Corners", "Cozy Winter", "Morning Rituals", "Slow Sundays", "Morning Breakfast" 

Respond with ONLY the name, nothing else."""

    messages = [{"role": "user", "content": prompt}]
    output = namer(messages, max_new_tokens=15, do_sample=True, temperature=0.7)
    name = output[0]["generated_text"][-1]["content"].strip()

    return NamingResponse(name=name)