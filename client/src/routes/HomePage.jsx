import { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Chip,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Toolbar,
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

  if (weatherQuery.isLoading) {
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
  const time = current?.time ?? null;

  return (
    <Stack spacing={1.25}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h6" fontWeight={800}>
            {selectedCity.name}
            {selectedCity.admin1 ? `, ${selectedCity.admin1}` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCity.country ? `${selectedCity.country}` : "—"}
            {timezone ? ` · ${timezone}` : ""}
            {time ? ` · ${time}` : ""}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Typography variant="h3" fontWeight={900} lineHeight={1}>
          {temperature !== null ? `${Math.round(temperature)}°` : "—"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {wind !== null ? `Wind: ${wind}` : "Wind: —"}
          {code !== null ? ` · Code: ${code}` : ""}
        </Typography>
      </Stack>
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

  const disabled = !message.trim() || pushMessageMutation.isPending;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" fontWeight={800}>
        Push message
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Broadcast a message to everyone viewing this city.
      </Typography>
      <TextField
        value={message}
        onChange={({ target: { value } }) => setMessage(value)}
        placeholder="Type a message…"
        multiline
        minRows={3}
        fullWidth
      />
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          color="success"
          onClick={pushAdminMessage}
          disabled={disabled}
        >
          {pushMessageMutation.isPending ? "Sending…" : "Sent"}
        </Button>
        {pushMessageMutation.isError ? (
          <Typography variant="body2" color="error">
            {pushMessageMutation.error?.message || "Failed to send."}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
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
  }, [selectedCity?.id, selectedCity?.latitude, selectedCity?.longitude]);

  function onDismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background:
          "radial-gradient(1200px 700px at 10% -10%, rgba(25, 118, 210, 0.12), transparent 60%), radial-gradient(900px 600px at 100% 10%, rgba(46, 125, 50, 0.10), transparent 55%)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{ backdropFilter: "blur(10px)" }}
      >
        <Toolbar>
          <Container maxWidth="md" disableGutters sx={{ px: { xs: 2, sm: 0 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Weather
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Signed in as <code>{auth.user.username}</code> (
                  {auth.user.role})
                </Typography>
              </Box>
              <Button color="inherit" onClick={() => auth.logout()}>
                Logout
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    City
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select or search a city to see weather.
                  </Typography>
                </Box>
                <CitySelector
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Current weather
                  </Typography>
                </Box>
                <Divider />
                <WeatherDisplay selectedCity={selectedCity} />
              </Stack>
            </CardContent>
          </Card>

          {auth.user.role === "admin" ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <AdminMessage cityId={selectedCity.id} />
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Container>

      <Toast toasts={toasts} onDismiss={onDismiss} />
    </Box>
  );
}
