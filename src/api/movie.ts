import axios from "axios";

const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
});

const token = import.meta.env.VITE_API_KEY;

tmdbApi.interceptors.request.use((config) => {
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const discoverMovies = async () => {
  const response = await tmdbApi.get(
    `discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`
  );
  return response.data;
};

export const getTrendingMovies = async (period: string, page: number) => {
  const response = await tmdbApi.get(`/trending/movie/${period}`, {
    params: {
      page: `${page}`,
    },
  });
  return response.data;
};

export const getMovieVideos = async (movieId: string | undefined) => {
  const response = await tmdbApi.get(`movie/${movieId}/videos`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};

export const getMovieDetails = async (movieId: string | undefined) => {
  const response = await tmdbApi.get(`movie/${movieId}`, {
    params: {
      language: "en-US",
    },
  });
  return response.data;
};

export const getMoviesType = async (
  page: number,
  type:
    | "with_original_language"
    | "with_companies"
    | "with_origin_country"
    | "with_genres",
  typeId: string | undefined
) => {
  const response = await tmdbApi.get(`discover/movie?`, {
    params: {
      include_adult: false,
      include_video: false,
      language: "en-US",
      page: `${page}`,
      sort_by: "popularity.desc",
      [type]: `${typeId}`,
    },
  });

  return response.data;
};

export const getList = async (page: number, list: "top_rated" | "upcoming" | "now_playing" | "popular") => {
  const response = await tmdbApi.get(`movie/${list}?`, {
    params: {
      page: `${page}`,
    },
  });

  return response.data;
};

export const searchMovies = async (pageNumber: number, searchQuery: string) => {
  const response = await tmdbApi.get(`search/movie?`, {
    params: {
      page: `${pageNumber}`,
      query: `${searchQuery}`,
    },
  });
  return response.data;
};

export const getMovieRecommendations = async (movieId: string | undefined) => {
  const response = await tmdbApi.get(`movie/${movieId}/recommendations`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};

export const getMovieCredits = async (movieId: string | undefined) => {
  const response = await tmdbApi.get(`movie/${movieId}/credits`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};

export const getMovieImages = async (movieId: string | undefined) => {
  const response = await tmdbApi.get(`movie/${movieId}/images`);
  return response.data.logos || [];
};
