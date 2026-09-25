import torch
import open_clip
from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline

device = "cuda" if torch.cuda.is_available() else "cpu"

# --- CLIP: image embeddings ---
clip_model, _, clip_preprocess = open_clip.create_model_and_transforms(
    'ViT-B-32', pretrained='laion2b_s34b_b79k'
)
clip_model = clip_model.to(device)
clip_model.eval()

# --- BLIP: image captioning ---
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-large"
).to(device)
blip_model.eval()

# --- Qwen: board naming ---
namer = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-1.5B-Instruct",
    device=0 if torch.cuda.is_available() else -1
)