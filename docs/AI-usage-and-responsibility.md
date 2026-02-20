# AI in This Project: What We Use, Sustainability & Responsibility

*Summary for presentations and stakeholders.*

---

## What AI we use

| Aspect | Detail |
|--------|--------|
| **Provider** | [Anthropic](https://www.anthropic.com) |
| **Model** | **Claude** (Sonnet family). Configurable via env (e.g. `claude-sonnet-4-20250514` or `claude-sonnet-4-6`). |
| **Where** | Story upload flow: one AI call per image or video upload. |
| **API** | Anthropic Messages API (`https://api.anthropic.com/v1/messages`) with image + text input. |

### What the AI does

1. **Content moderation**  
   Each uploaded image (or one extracted video frame) is analysed for:
   - Nudity or sexual content  
   - Profanity or offensive text  
   - Violence or gore  
   - Drugs, weapons, illegal items  
   - Contact information (phone, email, social handles)  
   - Off-topic content (we restrict to beauty & wellness: haircuts, colouring, nails, facials, massages, makeup, hair styling, skincare, waxing, brow/lash).

2. **Treatment classification**  
   The same call returns:
   - A **content type** (e.g. “Hair Colouring”, “Balayage”)  
   - **Tags** for discovery  
   - **Confidence** and **flagged categories** for transparency.

3. **Mapping to your catalogue**  
   The inferred content type is matched to your canonical treatment list (id + name) so the B2C app shows a consistent treatment name only when the upload is **approved** by moderation.

So: **one AI provider (Anthropic), one model family (Claude Sonnet), used for safety + classification in the story upload flow.**

---

## How it’s sustainable

- **On-demand only**  
  AI runs only when a partner uploads a story (one request per image, or one frame per video). No continuous or background inference.

- **Controlled payload**  
  - Images sent as needed for moderation.  
  - Videos: we send a **single extracted frame** (e.g. ~10% into the clip) instead of the full video, reducing tokens and cost.

- **Bounded output**  
  We ask for a **small, structured JSON** (moderation status, reasons, content type, tags, confidence, flags) with a low `max_tokens` (e.g. 1000), so each call is predictable in size and cost.

- **Model choice**  
  The model is configurable via environment variables. You can choose a smaller or faster Claude variant to balance cost, latency, and quality (e.g. Sonnet vs Haiku) without code changes.

- **No training or fine-tuning**  
  We use the model as provided by Anthropic; no custom training or long-term retention of user media for model building.

---

## How it’s responsible

- **Clear purpose**  
  AI is used only for: (1) keeping the platform safe and on-brand, and (2) labelling content for better discovery. No hidden or secondary uses.

- **Transparent rules**  
  The moderation policy is explicit in the system prompt (nudity, profanity, violence, illegal items, contact info, off-topic). Rejections are based on these categories so we can explain *why* something was rejected.

- **User-friendly feedback**  
  When content is rejected, we show **human-readable reasons** (from `moderationReasons`) and which **categories** were flagged, so partners can understand and adjust their content.

- **Human agency**  
  Rejected content can be removed and **re-uploaded** with a different image. Partners can retry without being blocked by a single failed validation.

- **Scoped to the product**  
  The AI is instructed that the platform is for beauty & wellness only; off-topic content is explicitly out of scope, which keeps behaviour aligned with Treatwell’s positioning.

- **Structured output**  
  We require a strict JSON schema from the model. That reduces free-form text and helps avoid misuse of the output (e.g. we don’t surface raw model text; we only use the structured fields).

- **No PII in prompts**  
  We send only the image (or one frame) and a short, fixed instruction. We don’t inject user names, emails, or other PII into the prompt.

- **Provider commitment**  
  Anthropic publishes on safety, transparency, and responsible scaling; we align with that by using their API under their terms and best practices.

---

## One-line summary for slides

- **What:** “We use **Anthropic’s Claude (Sonnet)** to moderate story uploads and classify treatment type—one call per upload, on-demand.”  
- **Sustainable:** “AI runs only when a partner uploads; we send one frame per video and a small structured response to keep usage and cost predictable.”  
- **Responsible:** “Moderation rules are clear and limited to safety and relevance; we show partners why content was rejected and let them re-upload a different image.”

---

*Last updated for project presentation. Model name and env vars are in the codebase (e.g. `story-upload-modal.tsx`); do not put API keys in slides or shared docs.*
