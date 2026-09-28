---
name: Direct AI provider fallback
description: When the managed Replit AI integration is unavailable, use a workspace secret for the explicitly requested provider instead of retrying account setup.
---

The managed AI integration may be blocked by account limits. For an explicitly requested provider, the safe fallback is a provider API key requested through workspace secrets and a direct server-side SDK or HTTP call; never expose the key in chat.

**Why:** Account upgrade prompts can block an otherwise valid build, while asking for credentials in chat risks leaking them.

**How to apply:** Check whether the managed integration is actually available before wiring the feature. If setup reports an account upgrade requirement, stop retrying and use the secrets flow for the same provider.