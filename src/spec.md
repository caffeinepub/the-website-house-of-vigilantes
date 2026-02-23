# Specification

## Summary
**Goal:** Add a Van Gogh-inspired landing page with authentication, theme persistence, and post-action redirects to improve user onboarding and session management.

**Planned changes:**
- Create new landing page with Van Gogh background, Sign Up/Log In buttons, and light/dark mode toggle
- Update routing to show landing page for unauthenticated users and redirect authenticated users to /home
- Implement theme persistence using localStorage to remember user's light/dark preference across sessions
- Update Log Out button to redirect to landing page with smooth fade transition after clearing session
- Update Delete Account flow to redirect to landing page with smooth fade transition after deletion
- Enhance Delete Account modal with semi-transparent overlay and blurred background
- Verify backend deleteAccount function properly removes all user data

**User-visible outcome:** Users see a welcoming Van Gogh-inspired landing page when first visiting the site, can easily sign up or log in, have their theme preference remembered across sessions, and are smoothly redirected to the landing page after logging out or deleting their account.
