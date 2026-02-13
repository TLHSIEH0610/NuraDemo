// import Toast from "../components/Toast.jsx";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

export default function () {
  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Button color="inherit" onClick={() => auth.logout()}>
        Logout
      </Button>

      <Container maxWidth="md">
        <Card>
          <CardContent>homepage</CardContent>
        </Card>
      </Container>
    </Box>
  );
}
