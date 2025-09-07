# AngleForge — Multi-Angle Product Generator

Our app generates 4–10 retail-ready product views from a single reference image using **Gemini 2.5 Flash Image Preview (also known as Nano Banana)**. We first extract a concise **PRODUCT PROFILE** to lock in the product's identity (colors, materials, geometry). Then, we plan a series of canonical camera angles (front, 3/4, side, back, top) and re-render the **same product** from each new viewpoint. The system enforces strict faithfulness—no design changes, no invented details—and outputs images on white, transparent, or showroom backgrounds with realistic contact shadows. This process helps sellers showcase multiple angles while preserving product identity, improving buyer confidence and conversion rates.

---

## Core Features & Constraints

*   **High-Volume Generation**: Creates **4–10 images** per run. The default set includes 6 standard e-commerce angles: **Front, 3/4 Left, Left, Back, 3/4 Right, and Right**.
*   **Identity Preservation**: Strictly maintains the product's original identity, including colors, materials, form, and logos. It does not add or remove design details.
*   **Flexible Backgrounds**: Supports multiple background modes: `white` for a clean look, `transparent` (with an alpha channel) for versatile use, and `showroom` for a professional studio setting. A subtle contact shadow can be added for realism.
*   **Safety First**: Does not alter images of people, including skin or body modifications. It also avoids fabricating or altering brand logos beyond what is visible in the source image. All generated outputs are labeled.

---

## How to Run Locally

**Prerequisites:** Node.js v18+ and a package manager like npm.

**1. Install Dependencies**
```bash
npm install
```

**2. Set Up Environment Variables**
Create a file named `.env.local` in the project root. This file will store your API key and should not be committed to version control.
```
# .env.local
API_KEY=YOUR_API_KEY_HERE
```

**3. Run the Development Server**
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (the exact port will be shown in your terminal).

**4. Build for Production**
```bash
# Creates a static build in the dist/ folder
npm run build

# Preview the production build locally
npm run preview
```

---

## Technical Workflow

The application uses a multi-step pipeline to ensure high-fidelity and consistent outputs.

1.  **Inputs**: The user provides a source product image, the desired number of views (4-10), a background mode (`white`, `transparent`, `showroom`), and optional extra instructions (e.g., "subtle contact shadow").

2.  **Describe Product (Node 1)**: The source image is sent to `gemini-2.5-flash`. The model analyzes the image and extracts a concise technical specification, including shape, materials, colors, and unique details. This text, called the `product_profile`, acts as a "fingerprint" to maintain identity in subsequent steps.

3.  **Angle Planner (Node 2)**: Based on the requested number of views, a simple utility generates a JSON array of camera angles (`angle_list`). Each angle specifies yaw, pitch, and distance.

4.  **Render Views (Node 3)**: The application iterates through each angle in the `angle_list`. For each one, it sends the original `product_image`, the `product_profile`, and the target camera angle to `gemini-2.5-flash-image-preview`. This model re-renders the product from the new perspective, strictly adhering to the system prompt and product profile.

5.  **Outputs**: The generated images are displayed in a grid. The user can download individual images or a ZIP archive containing all views, named according to their angle (e.g., `product_front.png`).

---

## Prompt Engineering Details

### 1. System Prompt (For Rendering Views)

This prompt is provided as the `systemInstruction` to the image generation model to set the foundational rules for its behavior.

```
You are an expert product view synthesizer. Your task is to generate multiple, novel camera views of the SAME product from a reference image, while strictly preserving its identity.

Rules:
1.  **Identity Faithfulness**: You MUST preserve the exact design, colors, materials, textures, proportions, and any logos present in the reference image. Do NOT invent new features, change colors, or stylize the product. The goal is an identical product, just from a new angle.
2.  **Novel View Generation**: Re-render the identical product from the specified camera yaw/pitch/roll and distance. Maintain a consistent scale and lens perspective across all generated outputs to ensure they look like a cohesive set.
3.  **Background & Shadowing**:
    -   **white**: Use a pure #FFFFFF backdrop. Render a subtle, realistic contact shadow directly under the product to ground it.
    -   **transparent**: The output must have an RGBA alpha channel for a transparent background. The faint ground shadow should be baked into the image.
    -   **showroom**: Create a neutral gray gradient floor with soft, professional studio lighting.
4.  **Photorealism**: Outputs must be sharp and photorealistic. Avoid halos, double contours, or blurry edges. Accurately preserve the material finish (e.g., gloss, matte, fabric, metal). Do not add motion blur.
5.  **Safety & Ethics**: You must NEVER modify people's bodies or skin if they appear in the photo. Do not generate harmful or unsafe content. Do not fabricate or alter brand marks beyond what is visible in the reference.

Your final output for each request should be a single, high-quality image of the product from the requested angle with the specified background.
```

### 2. Task Prompt: Describe Product

This prompt instructs the model to create the `product_profile`.

```
Analyze the product in the provided image and produce a concise technical specification (90–140 words).
This specification must include:
- Shape and key geometry
- Impression of dimensions
- Dominant colors (use hex codes if possible)
- Materials and finishes (e.g., matte, gloss, fabric)
- Notable details like seams, vents, patterns, or textures
- Any visible branding or logos.
This text will be used to preserve the product's identity in later rendering steps. Do not infer features that are not visible.
Return only the plain text description under the title: PRODUCT PROFILE.
```

### 3. Task Prompt: Render Views (per angle)

This is the main prompt used in a loop to generate each new view. It combines the original image, the generated profile, and the specific angle for the current iteration.

```
Task: Re-render the product from the reference image at the specified new camera angle.

REFERENCE IMAGE: (provided as image part)
PRODUCT PROFILE: ${productProfile}

CAMERA ANGLE: ${JSON.stringify(angle)}
BACKGROUND MODE: ${backgroundMode}
OPTIONAL INSTRUCTIONS: ${extras || 'None'}

Your task is to re-render the SAME product shown in the REFERENCE IMAGE from the specified new CAMERA ANGLE.

Requirements:
- Strictly follow all rules in the system prompt.
- Identity Preservation: The rendered product must be identical to the one in the reference image. Do NOT change its design, colors, materials, textures, proportions, or logos.
- Photorealism: The output must be a crisp, photorealistic image with correct perspective and foreshortening for the given angle.
- Background: Apply the BACKGROUND MODE rules. Include a soft, realistic contact shadow consistent with studio lighting.
- Scale & Framing: Maintain a consistent scale and framing for the product.

Generate a single image of the product from this new viewpoint.
```

---

## Competition Compliance Notes
- **Team size**: 1 (solo). One Kaggle account only; one final submission.
- **External Tools**: Google AI Studio / Gemini (publicly accessible; reasonable cost). No proprietary datasets with excessive cost.
- **Code License**: Repository under MIT (or Apache-2.0). If selected as a winner, we agree to license the winning Submission and source code under **CC BY 4.0** per competition rules.
- **Reproducibility**: This repo + instructions reproduce the demo. No private code or data used.
- **Safety**: No identity/body/skin edits; no fabricated logos. Outputs labeled “AI-generated”.

---

## Troubleshooting
*   **401/403 API Error**: Check that your `API_KEY` in the `.env.local` file is correct and valid. This application makes API calls directly from the client, which is suitable for local development. For a production environment, it is strongly recommended to route API calls through a secure backend proxy to protect your API key.
*   **CORS Errors**: If you are proxying requests through your own server, ensure it is configured with the correct `Access-Control-Allow-Origin` headers for your UI's domain.
*   **Slow Generation / Heavy Images**: Use optimized source images (e.g., JPG/PNG under 4MB) with clean backgrounds for best results. Reduce the `num_views` when testing to iterate faster.
*   **Halos or Artifacts**: If you see artifacts around the product, try adding a clarifying instruction like: *"Ensure clean, sharp edges with no halos. The contact shadow should be soft and around 10-15% opacity."* to the "Optional Instructions" field.
