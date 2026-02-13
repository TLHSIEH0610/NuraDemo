import { Autocomplete, TextField } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useCitiesQuery } from "../quires/useCitiesQuery";
import { useDebounce } from "../hooks/useDebounce";

export default function ({
  cities,
  selectedCityId,
  onSelectedCityIdChange,
  loading,
  error,
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const enableRemote = debouncedQuery.trim().length >= 2;
  const citiesQuery = useCitiesQuery(debouncedQuery, {
    enabled: enableRemote,
  });

  async function onChange(_, next) {
    if (!next) return;
  }

  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      inputValue={query}
      onInputChange={(_, next) => setQuery(next)}
      filterOptions={(x) => x}
      disabled={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="City"
          placeholder={loading ? "Loading" : "Search or select a city…"}
          error={isError}
          helperText={helperText}
        />
      )}
    />
  );
}
