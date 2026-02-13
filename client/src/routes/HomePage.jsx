import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { useAuth } from "../auth/AuthContext.jsx";
import CitySelector from "../components/CitySelector.jsx";
import { useWeatherQuery } from "../quires/useWeatherQuery";

const DEFAULT_CITY = {
  id: "default:melbourne",
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

export default function HomePage() {
  const auth = useAuth();
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);

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
        </Stack>
      </Container>
    </Box>
  );
}
