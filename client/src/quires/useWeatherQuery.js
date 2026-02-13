import { useQuery } from "@tanstack/react-query";
import { http } from "../services/http";
import { useAuth } from "../auth/AuthContext.jsx";

export function useWeatherQuery({ latitude, longitude }, { enabled } = {}) {
  const auth = useAuth();

  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () =>
      http(
        `/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`,
        { token: auth.token },
      ),
    enabled: auth.isAuthed && enabled,
  });
}
