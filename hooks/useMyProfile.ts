import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../api/routes/userRoutes";

export const useMyProfile = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: isAuthenticated && !!localStorage.getItem("authToken"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

