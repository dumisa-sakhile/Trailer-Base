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

export const getTrendingTV = async (period: string, page: number) => {
  const response = await tmdbApi.get(`/trending/tv/${period}`, {
    params: {
      page: `${page}`,
    },
  });
  return response.data;
};

export const getTVVideos = async (tvId: string | undefined) => {
  const response = await tmdbApi.get(`tv/${tvId}/videos`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};

export const getTVDetails = async (tvId: string | undefined) => {
  const response = await tmdbApi.get(`tv/${tvId}`, {
    params: {
      language: "en-US",
    },
  });
  return response.data;
};

export const getTVVType = async (
  page: number,
  type:
    | "with_original_language"
    | "with_companies"
    | "with_origin_country"
    | "with_genres",
  typeId: string | undefined
) => {
  const response = await tmdbApi.get(`discover/tv?`, {
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

export const getTVList = async (
  page: number,
  list: "airing_today" | "on_the_air" | "top_rated" | "popular"
) => {
  const response = await tmdbApi.get(`tv/${list}?`, {
    params: {
      page: `${page}`,
    },
  });

  return response.data;
};

export const searchTV = async (pageNumber: number, searchQuery: string) => {
  const response = await tmdbApi.get(`search/tv?`, {
    params: {
      page: `${pageNumber}`,
      query: `${searchQuery}`,
    },
  });
  return response.data;
};

export const getTVRecommendations = async (tvId: string | undefined) => {
  const response = await tmdbApi.get(`tv/${tvId}/recommendations`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};

export const getTVCredits = async (tvId: string | undefined) => {
  const response = await tmdbApi.get(`tv/${tvId}/credits`, {
    params: {
      language: "en-US",
      page: 1,
    },
  });
  return response.data;
};
