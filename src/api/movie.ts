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

export const getTrendingMovies = async (period: string, page: number) => {
  const response = await tmdbApi.get(`/trending/movie/${period}`, {
    params: {
      page: `${page}`,
    },
  });
  return response.data;
};

export const getPopularMovies = async (pageNumber: number) => {
  const response = await tmdbApi.get(`movie/popular?`, {
    params: {
      page: `${pageNumber}`,
    },
  });
  return response.data;
};

export const getTopRatedMovies = async (pageNumber: number) => {
  const response = await tmdbApi.get(`movie/top_rated?`, {
    params: {
      page: `${pageNumber}`,
    },
  });

  return response.data;
};

export const getUpcomingMovies = async (pageNumber: number) => {
  const response = await tmdbApi.get(`movie/upcoming?`, {
    params: {
      page: `${pageNumber}`,
    },
  });
  return response.data;
};

export const getNowPlayingMovies = async (pageNumber: number) => {
  const response = await tmdbApi.get(`movie/now_playing?`, {
    params: {
      page: `${pageNumber}`,
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
  type:"with_original_language"
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