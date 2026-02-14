import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../auth/AuthContext.jsx";
import CitySelector from "../components/CitySelector.jsx";
import { useWeatherQuery } from "../quires/useWeatherQuery";
import { io } from "socket.io-client";
import { usePushMessageMutation } from "../quires/usePushMessages.js";
import Toast from "../components/Toast.jsx";

const DEFAULT_CITY = {
  id: 2158177,
  name: "Melbourne",
  latitude: -37.8136,
  longitude: 144.9631,
  countryCode: "AU",
  country: "Australia",
  admin1: "Victoria",
  timezone: "Australia/Melbourne",
};

function WeatherDisplay({ selectedCity }) {
  const weatherQuery = useWeatherQuery(
    { latitude: selectedCity?.latitude, longitude: selectedCity?.longitude },
    { enabled: Boolean(selectedCity) },
  );

  if (!selectedCity) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select a city to see the weather.
      </Typography>
    );
  }

  if (weatherQuery.isFetching) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading weather…
      </Typography>
    );
  }

  if (weatherQuery.isError) {
    return (
      <Typography variant="body2" color="error">
        {weatherQuery.error?.message || "Failed to load weather."}
      </Typography>
    );
  }

  const timezone = weatherQuery.data?.timezone ?? null;
  const current = weatherQuery.data?.current ?? null;
  const temperature = current?.temperature_2m ?? null;
  const wind = current?.wind_speed_10m ?? null;
  const code = current?.weather_code ?? null;

  return (
    <Stack spacing={0.5}>
      <Typography variant="h6">
        {selectedCity.name}
        {selectedCity.country}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {`Timezone: ${timezone}`}
      </Typography>
      <Typography variant="body1">
        {temperature !== null ? `${temperature}°` : "—"}
        {wind !== null ? ` · Wind ${wind}` : ""}
        {code !== null ? ` · Code ${code}` : ""}
      </Typography>
    </Stack>
  );
}

function AdminMessage({ cityId }) {
  const [message, setMessage] = useState("");
  const pushMessageMutation = usePushMessageMutation();
  async function pushAdminMessage() {
    await pushMessageMutation.mutateAsync({ cityId, message });
    setMessage("");
  }

  return (
    <Card>
      <Typography>Push Message</Typography>
      <TextField
        value={message}
        onChange={({ target: { value } }) => setMessage(value)}
      />
      <Button variant="contained" color="success" onClick={pushAdminMessage}>
        Push
      </Button>
    </Card>
  );
}

export default function HomePage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const selectedCityRef = useRef(selectedCity);
  const socketRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    selectedCityRef.current = selectedCity;
  }, [selectedCity]);

  useEffect(() => {
    if (!auth.isAuthed) return;

    const socket = io("/", {
      path: "/socket.io",
      auth: { token: auth.token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      const city = selectedCityRef.current;
      const id = city?.id;
      if (!id) return;

      const latitude = city?.latitude;
      const longitude = city?.longitude;
      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      socket.emit("join_city", { cityId: id, latitude, longitude });
    });

    socket.on("city_message", (payload) => {
      const toastContent = {
        id: `${Date.now() - Math.random()}`,
        cityId: payload.cityId,
        message: payload.message,
        sentAt: payload.sentAt,
        title: "Message from your city",
      };
      setToasts((prev) => [toastContent, ...prev]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toastContent.id));
      }, 6000);
    });

    socket.on("weather_update", (payload) => {
      const latitude = payload?.latitude;
      const longitude = payload?.longitude;
      const weather = payload?.weather;

      if (typeof latitude !== "number" || typeof longitude !== "number") return;
      if (!weather) return;

      queryClient.setQueryData(["weather", latitude, longitude], weather);

      const toastContent = {
        id: `${Date.now()}-${Math.random()}`,
        cityId: payload.cityId,
        message: "Weather refreshed",
        sentAt: payload.fetchedAt || new Date().toISOString(),
        title: "Weather update",
      };
      setToasts((prev) => [toastContent, ...prev].slice(0, 5));
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toastContent.id));
      }, 6000);
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [auth.isAuthed, auth.token, queryClient]);

  useEffect(() => {
    const socket = socketRef.current;
    const id = selectedCity?.id;
    if (!socket || !id) return;

    const latitude = selectedCity?.latitude;
    const longitude = selectedCity?.longitude;
    if (typeof latitude !== "number" || typeof longitude !== "number") return;

    if (!socket.connected) return;
    socket.emit("join_city", { cityId: id, latitude, longitude });
  }, [
    selectedCity?.id,
    selectedCity?.latitude,
    selectedCity?.longitude,
  ]);

  function onDismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ py: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Weather</Typography>
            <Button color="inherit" onClick={() => auth.logout()}>
              Logout
            </Button>
          </Stack>

          <Card>
            <CardContent>
              <CitySelector
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <WeatherDisplay
                selectedCity={selectedCity}
                // weatherQuery={weatherQuery}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              {auth.user.role === "admin" && (
                <AdminMessage cityId={selectedCity.id} />
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
      <Toast toasts={toasts} onDismiss={onDismiss} />
    </Box>
  );
}
