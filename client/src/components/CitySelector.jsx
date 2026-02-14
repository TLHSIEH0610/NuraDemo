import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";

import { useCitiesQuery } from "../quires/useCitiesQuery";
import { useDebounce } from "../hooks/useDebounce";

export default function CitySelector({ selectedCity, setSelectedCity }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const { isError, error, isFetching, data } = useCitiesQuery(debouncedQuery);

  function onChange(_, v) {
    setSelectedCity(v);
    setQuery("");
  }
  return (
    <Autocomplete
      value={selectedCity}
      onChange={onChange}
      options={data?.cities || []}
      getOptionLabel={(c) => `${c.name}-${c.country} ${c.admin1 ?? ""}`}
      onInputChange={(_, v, reason) => {
        if (reason === "input" || reason === "clear") setQuery(v);
        if (reason === "blur") setQuery("");
      }}
      filterOptions={(x) => x}
      loading={isFetching}
      noOptionsText={query ? "No results" : "Type to search"}
      clearOnBlur={true}
      renderInput={(params) => (
        <TextField
          {...params}
          label="City"
          placeholder={isFetching ? "Loading" : "Search a city…"}
          error={isError}
          helperText={isError && error.message}
        />
      )}
    />
  );
}
