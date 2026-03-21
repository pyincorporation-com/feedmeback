import api from "./api";

export const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};
