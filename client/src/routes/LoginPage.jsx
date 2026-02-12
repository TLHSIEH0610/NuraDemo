import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
    }
    navigate("/", { replace: true });
  }
  return (
    <Container maxWidth="sm">
      <Card>
        <CardContent>
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              label="Username"
              value={formState.username}
              onChange={({ target: { value } }) =>
                setFormState((prev) => ({ ...prev, username: value }))
              }
              fullWidth
            />
            <TextField
              label="Password"
              value={formState.password}
              onChange={({ target: { value } }) =>
                setFormState((prev) => ({ ...prev, password: value }))
              }
              type="password"
              fullWidth
            />
            {loginStatus.isError ? (
              <Alert severity="error">
                {loginStatus.error?.message || "Login failed"}
              </Alert>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              disabled={loginStatus.isPending}
              fullWidth
            >
              {loginStatus.isPending ? "Logging in…" : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
