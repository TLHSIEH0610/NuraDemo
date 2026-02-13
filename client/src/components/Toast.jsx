import { Alert, Snackbar } from "@mui/material";

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
            severity={t.severity || "info"}
            variant="filled"
            onClose={() => onDismiss(t.id)}
          >
            {t.title ? (
              <>
                <strong>{t.title}</strong>
                {"\n"}
              </>
            ) : null}
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
