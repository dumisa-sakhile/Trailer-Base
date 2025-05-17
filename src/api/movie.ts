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