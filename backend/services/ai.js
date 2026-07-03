const fs = require("fs");
const sharp = require("sharp");
const { CATEGORIES } = require("../constants/categories");

const KEYWORDS = {
  Portrait: ["person", "people", "face", "woman", "man", "child", "baby", "girl", "boy", "head", "selfie"],
  Wedding: ["wedding", "bride", "groom", "marriage", "dress", "tuxedo", "ring", "bouquet"],
  Landscape: ["mountain", "ocean", "sea", "beach", "forest", "nature", "sky", "sunset", "sunrise", "lake", "river", "valley", "cliff", "coast", "snow"],
  Street: ["street", "city", "urban", "building", "road", "alley", "downtown", "skyline", "bridge", "sidewalk"],
  Event: ["party", "celebration", "concert", "festival", "crowd", "stage", "fireworks", "balloon"],
  Food: ["food", "dish", "meal", "fruit", "pizza", "cake", "dessert", "coffee", "drink", "plate", "sandwich", "salad"],
  Fashion: ["fashion", "runway", "clothing", "accessory", "jewelry", "handbag", "couture"],
  Macro: ["flower", "insect", "leaf", "petal", "butterfly", "bee", "feather"],
  Wildlife: ["animal", "bird", "cat", "dog", "horse", "tiger", "lion", "elephant", "deer", "eagle", "fish"],
  Product: ["product", "object", "bottle", "electronics", "furniture", "packaging"],
};

async function categorizeImage(imagePath) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return "Uncategorized";

  try {
    const resized = await sharp(imagePath)
      .resize({ width: 512, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    const base64 = resized.toString("base64");

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: base64,
          parameters: { top_k: 50 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) return "Uncategorized";

    const data = await response.json();
    if (!Array.isArray(data)) return "Uncategorized";

    const scores = {};
    for (const { label, score } of data) {
      const lower = label.toLowerCase();
      for (const [cat, words] of Object.entries(KEYWORDS)) {
        if (words.some((w) => lower.includes(w))) {
          scores[cat] = (scores[cat] || 0) + score;
        }
      }
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0.05 ? best[0] : "Uncategorized";
  } catch {
    return "Uncategorized";
  }
}

module.exports = { categorizeImage };
