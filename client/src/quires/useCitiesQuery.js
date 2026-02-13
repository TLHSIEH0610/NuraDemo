import { useQuery } from "@tanstack/react-query";
import { http } from "../services/http";

export function useCitiesQuery(name, { enabled }) {
  const auth = useAuth();
  return useQuery({
    queryKey: ["cities", name],
    queryFn: () =>
      http(`/api/cities?name=${encodeURIComponent(name)}`, {
        token: auth.token,
      }),
    enabled: auth.isAuthed && enabled,
  });
}
