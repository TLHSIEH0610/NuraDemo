import { useMutation } from "@tanstack/react-query";
import { http } from "../services/http";
import { useAuth } from "../auth/AuthContext";

export function usePushMessageMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ cityId, message }) => {
      return http("/api/messages", {
        method: "POST",
        body: { cityId, message },
        token,
      });
    },
  });
}
