# Trailer Base

[Trailer Base](https://trailer-base.vercel.app) is a modern web application that serves as a comprehensive movie and TV trailer database, providing users with the latest trailers and detailed information about movies, TV shows, and industry professionals. Built with React, TypeScript, and Tailwind CSS, it leverages the [TMDB API](https://www.themoviedb.org/documentation/api) for rich media content, Firebase for authentication and bookmarking, and TanStack Query with Axios for efficient data fetching. The app uses TanStack Router for file-based routing and Sonner for user notifications, delivering a seamless and responsive experience across devices.

## Features
- **Explore Movies, TV Shows, and People**: Browse detailed information and trailers across dedicated routes for movies, TV shows, and industry professionals (actors, directors, etc.).
- **TMDB API Integration**: Fetches real-time data for movies, TV shows, and people, including posters, trailers, cast, and crew details.
- **User Authentication**: Supports Magic Link and Google OAuth login via Firebase Authentication.
- **Bookmarking**: Save favorite movies and TV shows to your profile using Firestore.
- **Search Functionality**: Search for movies, TV shows, or people with a responsive search interface.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices using Tailwind CSS.
- **Dynamic Data Fetching**: Uses TanStack Query and Axios for efficient, cached API requests.
- **Notifications**: Displays user feedback (e.g., bookmark success) with Sonner.
- **File-Based Routing**: Navigates routes like `/movies`, `/tv`, and `/people` using TanStack Router.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query, Axios
- **Backend Services**:
  - **Firebase**: Authentication (Magic Link, Google OAuth), Firestore for bookmarking
  - **TMDB API**: Movie, TV, and person data, including trailers and images
- **Notifications**: Sonner
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Assets**: Custom images and SVGs in the `public` folder

## Main Routes
Trailer Base organizes content into three primary routes, powered by TanStack Router:
- **/movies**: Browse movie listings, view trailers, and access details like genres, release dates, and cast. Includes dynamic routes like `/movie/:movieId` and `/movie/:type/:typeName/:typeId`.
- **/tv**: Explore TV shows with episode guides, trailers, and network details. Includes routes like `/tv/:tvId` and `/tv/:type/:typeName/:typeId`.
- **/people**: View profiles of actors, directors, and other professionals, including filmographies. Includes routes like `/people/:personId`.
- **/auth**: Manage authentication with routes for sign-up (`/auth/sign_up`), profile (`/auth/profile`), and verification (`/auth/verify`).
- **/**: Home page with featured content and navigation.

## Prerequisites
- Node.js (v16 or higher) and npm
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A Firebase project with Authentication (Magic Link, Google OAuth) and Firestore enabled
- A modern web browser (Chrome, Firefox, Safari, etc.)

## Installation
To run Trailer Base locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/dumisa-sakhile/Trailer-Base.git
   cd Trailer-Base
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory based on `.env.example` (if present).
   - Add your TMDB API key and Firebase configuration:
     ```env
     VITE_TMDB_API_KEY=your-tmdb-api-key
     VITE_FIREBASE_API_KEY=your-firebase-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. **Set Up Firebase**:
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Magic Link and Google OAuth providers) and **Firestore Database**.
   - Update `src/config/firebase.ts` with your Firebase configuration if not using environment variables.

5. **Set Up TMDB API**:
   - Sign up for a TMDB account and request an API key at [TMDB API](https://www.themoviedb.org/settings/api).
   - Ensure the API key is added to your `.env` file or directly in API files (`src/api/movie.ts`, `src/api/tv.ts`, `src/api/people.ts`).

6. **Run the Application**:
   - Start the development server:
     ```bash
     npm run dev
     ```
   - Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage
1. **Home Page**: View featured movies, TV shows, or trending content with embedded trailers.
2. **Navigation**:
   - Use the `Header` or `BottomNav` to access **Movies**, **TV**, **People**, or **Auth** routes.
   - Sign up or log in via Magic Link or Google OAuth from `/auth/sign_up` or `/auth`.
   - Access your profile at `/auth/profile` to view bookmarked movies and TV shows.
3. **Explore Content**:
   - **Movies**: Browse listings at `/movies/list/:list` or view details at `/movie/:movieId`.
   - **TV**: Explore shows at `/tv/list/:list` or view details at `/tv/:tvId`.
   - **People**: View profiles at `/people/:personId` with filmographies and biographies.
4. **Bookmarking**: Use the `BookmarkButton` or `TvBookmarkBtn` to save favorites to Firestore, accessible in your profile.
5. **Search**: Use the `Search` component to find movies, TV shows, or people.
6. **Notifications**: Receive feedback (e.g., "Movie bookmarked!") via Sonner toasts.

## Project Structure
```
Trailer-Base/
├── .qodo/                         # Qodo configuration (if applicable)
├── .vscode/                       # VSCode settings
│   └── settings.json
├── public/                        # Static assets
│   ├── favicon.ico
│   ├── female.jpg
│   ├── male.jpg
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── robots.txt
│   ├── search.svg
│   └── star-rating.svg
├── src/                           # Source code
│   ├── api/                       # TMDB API request logic
│   │   ├── movie.ts
│   │   ├── people.ts
│   │   └── tv.ts
│   ├── components/                # Reusable React components
│   │   ├── icons/Icons.tsx
│   │   ├── BackgroundMedia.tsx
│   │   ├── BackHomeBtn.tsx
│   │   ├── BookmarkButton.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Button.tsx
│   │   ├── CardLink.tsx
│   │   ├── CastCard.tsx
│   │   ├── Credit.tsx
│   │   ├── Display.tsx
│   │   ├── EditProfileForm.tsx
│   │   ├── EscKeyHandler.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── InfoSection.tsx
│   │   ├── InfoTvSection.tsx
│   │   ├── LinkTo.tsx
│   │   ├── Loading.tsx
│   │   ├── LogoDisplay.tsx
│   │   ├── MediaCard.tsx
│   │   ├── Modal.tsx
│   │   ├── NotFound.tsx
│   │   ├── PeopleCastCard.tsx
│   │   ├── Search.tsx
│   │   ├── SearchCard.tsx
│   │   ├── SeasonCard.tsx
│   │   ├── SeasonsSection.tsx
│   │   ├── TvBookmarkBtn.tsx
│   │   ├── TvDisplay.tsx
│   │   ├── TvDisplayCard.tsx
│   │   ├── TvLogoDisplay.tsx
│   │   ├── TvTypeLink.tsx
│   │   ├── TypeLink.tsx
│   │   └── useBookmarkMutations.tsx
│   ├── config/                    # Firebase configuration
│   │   └── firebase.ts
│   ├── context/                   # React context for state management
│   │   └── searchContext.tsx
│   ├── data/                      # Static data (e.g., genres)
│   │   ├── movieGenres.tsx
│   │   └── tvGenres.tsx
│   ├── routes/                    # TanStack Router file-based routes
│   │   ├── auth/
│   │   │   ├── index.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── route.tsx
│   │   │   ├── sign_up.tsx
│   │   │   └── verify.tsx
│   │   ├── movie/
│   │   │   ├── list/$list.tsx
│   │   │   ├── $movieId.tsx
│   │   │   └── $type.$typeName.$typeId.tsx
│   │   ├── people/
│   │   │   ├── $personId.tsx
│   │   │   └── index.tsx
│   │   ├── tv/
│   │   │   ├── list/$list.tsx
│   │   │   ├── $tvId.tsx
│   │   │   ├── $type.$typeName.$typeId.tsx
│   │   │   └── index.tsx
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── Types/                     # TypeScript interfaces
│   │   ├── movieInterfaces.ts
│   │   └── tvInterfaces.ts
│   ├── logo.svg
│   ├── main.tsx                   # React entry point
│   ├── reportWebVitals.ts         # Web vitals reporting
│   ├── routeTree.gen.ts           # Generated route tree for TanStack Router
│   └── styles.css                 # Tailwind CSS styles
├── .cta.json                      # Configuration file (if applicable)
├── .env                           # Environment variables
├── .gitignore
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── package-lock.json
├── tsconfig.json                  # TypeScript configuration
├── vercel.json                    # Vercel deployment configuration
└── vite.config.js                 # Vite configuration
```

## API Integration Details
- **TMDB API**: Fetches data for movies, TV shows, and people. Key endpoints include:
  - Movies: `GET /movie/{id}`, `GET /movie/popular`, `GET /movie/{id}/videos`
  - TV Shows: `GET /tv/{id}`, `GET /tv/popular`, `GET /tv/{id}/videos`
  - People: `GET /person/{id}`, `GET /person/{id}/movie_credits`
  - Handled in `src/api/` with TanStack Query and Axios for caching and efficient requests.
- **Firebase**:
  - Authentication: Magic Link and Google OAuth for secure login.
  - Firestore: Stores user bookmarks for movies and TV shows, accessible in the profile page.
- **Rate Limits**: TMDB allows 40 requests per 10 seconds. Ensure proper error handling in `src/api/` files.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request with a detailed description.

Please ensure:
- Code adheres to TypeScript and React best practices.
- Tailwind CSS classes follow the existing style.
- New features are tested and do not break existing functionality.
- API keys and sensitive data are not hardcoded.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For questions, feedback, or bug reports:
- GitHub: [dumisa-sakhile](https://github.com/dumisa-sakhile)
- Portfolio: [sakhile-dumisa.vercel.app](https://sakhile-dumisa.vercel.app)
- Live Site: [trailer-base.vercel.app](https://trailer-base.vercel.app)

## Acknowledgments
- [TMDB](https://www.themoviedb.org/) for the API.
- [Firebase](https://firebase.google.com/) for authentication and Firestore.
- [TanStack Router](https://tanstack.com/router) and [TanStack Query](https://tanstack.com/query) for routing and data fetching.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Sonner](https://sonner.emilkowal.ski/) for notifications.
- [Vite](https://vitejs.dev/) for fast development and build.
- [Vercel](https://vercel.com/) for deployment.
