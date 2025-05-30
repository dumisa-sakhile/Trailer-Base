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

export const getPopularPeople = async (page: number) => {
  const response = await tmdbApi.get("/person/popular", {
    params: {
      page: `${page}`,
    },
  });
  return response.data;
};

export const getTrendingPeople = async (period: string, page: number) => {
  const response = await tmdbApi.get(`/trending/person/${period}`, {
    params: {
      page: `${page}`,
    },
  });
  return response.data;
};

export const searchPeople = async (page: number, searchQuery: string) => {
  const response = await tmdbApi.get(`search/person?`, {
    params: {
      page: `${page}`,
      query: `${searchQuery}`,
    },
  });
  return response.data;
};

export const getPersonCredits = async (
  personId: string | number
) => {
  const response = await tmdbApi.get(
    `/person/${personId}/combined_credits?language=en-US`
  );
  return response.data;
};

export const getPersonDetails = async (personId: string | undefined) => {
  const response = await tmdbApi.get(`person/${personId}`, {
    params: {
      language: "en-US",
    },
  });
  return response.data;
};

export const searchPerson = async (page: number, searchQuery: string) => {
  const response = await tmdbApi.get(`search/person?`, {
    params: {
      page: `${page}`,
      query: `${searchQuery}`,
    },
  });
  return response.data;
};