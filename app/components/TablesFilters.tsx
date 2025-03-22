import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";

type Props = {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string[]) => void;
};

export const TableFilters = ({
  label,
  options,
  selectedValues,
  onChange,
}: Props) => {
  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          "&.Mui-focused": {
            color: "#2f006c",
          },
        }}
      >
        {label}
      </InputLabel>

      <Select
        multiple
        value={selectedValues}
        onChange={(e) => onChange(e.target.value as string[])}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected.join(", ")}
        sx={{
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2f006c",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2f006c",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
