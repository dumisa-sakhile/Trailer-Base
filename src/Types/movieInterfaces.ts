export interface MovieDetails {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
  runtime?: number;
  tagline?: string;
  overview?: string;
  homepage?: string;
  spoken_languages: { english_name: string; iso_639_1: string }[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
  production_countries: { name: string; iso_3166_1: string }[];
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface CastCardProps {
  id: number;
  name: string;
  profile_path?: string;
  character: string;
}

export interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
}

export interface MovieImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}
