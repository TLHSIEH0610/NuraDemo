import { useQuery } from "@tanstack/react-query";
import { http } from "../services/http";
import { useAuth } from "../auth/AuthContext.jsx";

export function useCitiesQuery(name) {
  const auth = useAuth();
  return useQuery({
    queryKey: ["cities", name],
    queryFn: () =>
      http(`/api/cities?name=${encodeURIComponent(name)}`, {
        token: auth.token,
      }),
    enabled: auth.isAuthed,
  });
}
