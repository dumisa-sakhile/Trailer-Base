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
