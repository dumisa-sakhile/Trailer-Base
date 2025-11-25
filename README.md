# Trailer Base

Trailer Base is a web app for browsing movie and TV trailers, built with React, TypeScript, and Tailwind CSS. It uses the TMDB API for media data, Firebase for authentication and bookmarking, TanStack Query for data fetching, TanStack Router for navigation, and Sonner for notifications.

This README was updated to reflect recent additions: a small Zustand store for "last viewed" media and a "Because you viewed…" recommendations list that shares cache with recommendation queries.

## Features
- Browse movies, TV shows, and people with trailers and details.
- TMDB API integration for posters, backdrops, trailers, cast, and recommendations.
- Firebase authentication (Magic Link, Google OAuth) and Firestore for bookmarking.
- "Because you viewed…" recommendations: a personalized list fed by the last-clicked media (uses a small zustand store).
- Skeleton UIs for smoother loading states.
- Search and filters for quick discovery.
- Responsive design with Tailwind CSS.
- Efficient data fetching with TanStack Query (queries share cache keys for recommendations).
- File-based routing with TanStack Router.

## Tech Stack
- Frontend: React + TypeScript
- Routing: TanStack Router
- Data fetching: TanStack Query
- State (small local): Zustand (last-viewed store)
- Backend services: Firebase (Auth, Firestore), TMDB API
- UI primitives: shadcn/ui components
- Styling: Tailwind CSS
- Notifications: Sonner
- Build: Vite
- Deployment: Vercel

## Main Routes
- `/movies` — Movie listings, trailers, and details (`/movie/:movieId`).
- `/tv` — TV show listings, episode guides, and details (`/tv/:tvId`).
- `/people` — Industry professionals and profiles (`/people/:personId`).
- Authentication is handled via an in-app Portal component (no dedicated `/auth` folder or routes). Use the Portal to open login/signup/verification flows and access the profile modal.
- `/` — Home page with featured content and personalized lists (e.g., "Because you viewed…").

Note: the in-app "Home" button resolves contextually (e.g., from a /tv page it navigates to `/tv`; from /people it navigates to `/people`).

## Prerequisites
- Node.js (v16+)
- React 19
- TMDB API key
- Firebase project (Authentication + Firestore)
- Modern web browser

## Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/dumisa-sakhile/Trailer-Base.git
   cd Trailer-Base
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment variables
   - The project reads TMDB key from environment variables. Depending on your setup (Vite vs Next), set one of the following:
     ```env
     # Vite
     VITE_TMDB_API_KEY=your-tmdb-api-key

     # Or (used by some components in this repo)
     NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
     ```
   - Firebase variables:
     ```env
     VITE_FIREBASE_API_KEY=your-firebase-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```
   - Note: some components may reference NEXT_PUBLIC_*; set whichever matches your local dev tooling or both to be safe.
4. Configure Firebase in `src/config/firebase.ts`.
5. Run the app:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Usage
- Home: personalized featured content and lists. If you click a media card, the app stores it as "last viewed" and may show a "Because you viewed…" recommendation row (if the clicked media has recommendations).
- Navigation: header or floating controls let you switch between Movies, TV, People, and Profile.
- Auth: sign in with Magic Link or Google OAuth via the in-app Portal (there is no separate `/auth` route). Open the Portal to sign up, verify, or manage your profile; bookmarks are saved to Firestore.
- Bookmarks: add/remove via bookmark buttons; view on your profile page.
- Search: find content by title, people, or keywords.

## Implementation notes
- Recommendations use a local fetcher in components (they intentionally do not call shared api helpers when configured that way). Query keys follow the pattern `['recommendations', type, id]` so recommendation results can be cached and shared across components.
- A small zustand store (src/stores/lastViewedStore.ts) holds the last viewed media (id + type) so "Because you viewed…" lists can be shown globally.
- Authentication now uses an in-app Portal component instead of a dedicated `src/routes/auth` folder. The Portal component opens login/signup/verification flows and the profile modal; adjust your routing references accordingly.
- Skeleton components match the real card sizes to avoid layout shifts and visual flashes.
- Buttons and UI elements are styled with shadcn/ui + Tailwind; accessibility attributes are applied where appropriate.

## Project Structure
```
Trailer-Base/
├── public/
├── src/
│   ├── api/                   # TMDB API helpers (some components may use direct fetch)
│   ├── components/            # React components (MediaCard, TvDisplay, BecauseYouViewed, etc.)
│   ├── config/                # Firebase config
│   ├── stores/                # small zustand stores (e.g., lastViewedStore)
│   ├── routes/                # TanStack Router routes
│   ├── main.tsx
│   └── styles.css
├── README.md
├── package.json
└── vite.config.js
```

## API Integration & Rate Limits
- TMDB API: endpoints used include `/movie/{id}`, `/tv/{id}`, and `/tv/{id}/recommendations`.
- Rate limits: TMDB allows ~40 requests per 10 seconds — keep prefetching and polling conservative.
- Recommendations: components may fetch recommendations directly; ensure your API key is properly scoped.

## Contributing
1. Fork the repo.
2. Create a branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push (`git push origin feature/your-feature`) and open a PR.

Please follow TypeScript/React best practices, Tailwind conventions, and avoid committing secrets or hardcoded keys.

## Contact
- GitHub: [dumisa-sakhile](https://github.com/dumisa-sakhile)
- Portfolio: [sakhiledumisa.com](https://sakhiledumisa.com)
- Live Site: [trailerbase.tech](https://trailerbase.tech)

## Acknowledgments
- TMDB, Firebase, TanStack Router/Query, Zustand, Tailwind CSS, Sonner, Vite, and Vercel.
