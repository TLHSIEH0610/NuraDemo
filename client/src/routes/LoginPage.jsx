import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext.jsx";

export default function () {
  const [formState, setFormState] = useState({ username: "", password: "" });
  const { login, loginStatus } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    loginStatus.reset();
    try {
      await login({
        username: formState.username,
        password: formState.password,
      });
    } catch (e) {
      console.error(e);
      return;
    }
    navigate("/", { replace: true });
  }
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(25, 118, 210, 0.14), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(46, 125, 50, 0.12), transparent 55%)",
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={6} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Nura Space
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Weather App Demo
                </Typography>
              </Box>

              <Divider />

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={formState.username}
                    onChange={({ target: { value } }) =>
                      setFormState((prev) => ({ ...prev, username: value }))
                    }
                    autoComplete="username"
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    value={formState.password}
                    onChange={({ target: { value } }) =>
                      setFormState((prev) => ({ ...prev, password: value }))
                    }
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                  />

                  {loginStatus.isError ? (
                    <Alert severity="error">
                      {loginStatus.error?.message || "Login failed"}
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ alignItems: "center" }}>
                      <code>admin</code>/<code>admin123</code>,<code>demo</code>
                      /<code>demo123</code>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loginStatus.isPending}
                    fullWidth
                  >
                    {loginStatus.isPending ? "Logging in…" : "Login"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
