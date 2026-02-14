import { Alert, AlertTitle, Snackbar } from "@mui/material";

export default function ({ toasts, onDismiss }) {
  return (
    <>
      {toasts.map((t, idx) => (
        <Snackbar
          key={t.id}
          open
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={6000}
          onClose={() => onDismiss(t.id)}
          sx={{ mt: idx * 7 }}
        >
          <Alert
            severity="info"
            variant="filled"
            onClose={() => onDismiss(t.id)}
          >
            {t.title ? <AlertTitle sx={{ mb: 0 }}>{t.title}</AlertTitle> : null}
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
