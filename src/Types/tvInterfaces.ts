interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path?: string | null;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  season_number: number;
  vote_average: number;
}

interface LastEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path?: string | null;
}

interface TVDetails {
  id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  first_air_date: string;
  episode_run_time?: number[];
  tagline?: string;
  overview?: string;
  homepage?: string;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  genres: { id: number; name: string }[];
  production_companies: {
    id: number;
    logo_path?: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  created_by: CreatedBy[];
  number_of_episodes: number;
  number_of_seasons: number;
  last_air_date?: string;
  last_episode_to_air?: LastEpisode | null;
  seasons: Season[];
  status: string;
  type: string;
}

interface Video {
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

interface CastCardProps {
  id: number;
  name: string;
  profile_path?: string;
  character: string;
}

interface TVProps {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
}

interface MediaImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export type {
  CreatedBy,
  Season,
  LastEpisode,
  TVDetails,
  Video,
  CastCardProps,
  TVProps,
  MediaImage
};