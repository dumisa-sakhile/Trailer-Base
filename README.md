# Trailer Base

[Trailer Base](https://trailer-base.vercel.app) is a web app for browsing movie and TV trailers, built with React, TypeScript, and Tailwind CSS. It uses the TMDB API for media data, Firebase for authentication and bookmarking, TanStack Query with Axios for data fetching, TanStack Router for navigation, and Sonner for notifications.

## Features
- Browse movies, TV shows, and industry professionals with trailers and details.
- TMDB API integration for real-time data (posters, trailers, cast, etc.).
- Firebase authentication (Magic Link, Google OAuth) and Firestore for bookmarking.
- Search for movies, TV shows, or people.
- Responsive design with Tailwind CSS.
- Efficient data fetching with TanStack Query and Axios.
- Notifications via Sonner.
- File-based routing with TanStack Router.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query, Axios
- **Backend**: Firebase (Authentication, Firestore), TMDB API
- **Notifications**: Sonner
- **Build**: Vite
- **Deployment**: Vercel

## Main Routes
- `/movies`: Movie listings, trailers, and details (`/movie/:movieId`).
- `/tv`: TV show listings, episode guides, and details (`/tv/:tvId`).
- `/people`: Profiles of actors and directors (`/people/:personId`).
- `/auth`: Sign-up (`/auth/sign_up`), profile (`/auth/profile`), and verification (`/auth/verify`).
- `/`: Home page with featured content.

## Prerequisites
- Node.js (v16+)
- TMDB API key
- Firebase project with Authentication and Firestore
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
3. Set up `.env` file with TMDB and Firebase keys:
   ```env
   VITE_TMDB_API_KEY=your-tmdb-api-key
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
4. Configure Firebase in `src/config/firebase.ts`.
5. Add TMDB API key to `src/api/` files.
6. Run the app:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

## Usage
- **Home**: View featured content and trailers.
- **Navigation**: Use header or bottom nav for Movies, TV, People, or Auth routes.
- **Auth**: Sign up/log in via Magic Link or Google OAuth; view bookmarks in `/auth/profile`.
- **Explore**: Browse movies (`/movies`), TV shows (`/tv`), or people (`/people`).
- **Bookmark**: Save favorites to Firestore via bookmark buttons.
- **Search**: Find content using the search component.

## Project Structure
```
Trailer-Base/
├── public/                    # Static assets (images, SVGs)
├── src/
│   ├── api/                   # TMDB API logic
│   ├── components/            # React components (BookmarkButton, Header, etc.)
│   ├── config/                # Firebase config
│   ├── context/               # Search context
│   ├── data/                  # Static data (genres)
│   ├── routes/                # TanStack Router routes
│   ├── Types/                 # TypeScript interfaces
│   ├── main.tsx               # React entry
│   └── styles.css             # Tailwind styles
├── .env                       # Environment variables
├── index.html                 # HTML entry
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vercel.json                # Vercel config
└── vite.config.js             # Vite config
```

## API Integration
- **TMDB API**: Fetches movies, TV shows, and people data (e.g., `/movie/{id}`, `/tv/{id}`). Handled in `src/api/` with TanStack Query and Axios.
- **Firebase**: Magic Link/Google OAuth for login; Firestore for bookmarks.
- **Rate Limits**: TMDB allows 40 requests/10 seconds; error handling in `src/api/`.

## Contributing
1. Fork the repo.
2. Create a branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push (`git push origin feature/your-feature`).
5. Open a Pull Request.

Ensure TypeScript/React best practices, Tailwind consistency, and no hardcoded keys.

## License
MIT License. See [LICENSE](LICENSE).

## Contact
- GitHub: [dumisa-sakhile](https://github.com/dumisa-sakhile)
- Portfolio: [sakhile-dumisa.vercel.app](https://sakhile-dumisa.vercel.app)
- Live Site: [trailer-base.vercel.app](https://trailer-base.vercel.app)

## Acknowledgments
- TMDB, Firebase, TanStack Router/Query, Tailwind CSS, Sonner, Vite, Vercel.