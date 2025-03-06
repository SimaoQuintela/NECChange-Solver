import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

interface RowRadioButtonsGroupProps {
  value: string; 
  setValue: (value: string) => void;
}

export default function RowRadioButtonsGroup({ value, setValue }: RowRadioButtonsGroupProps) {
  return (
    <FormControl>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={value || "1º Year"}
        onChange={(e) => setValue(e.target.value)}
      >
        <FormControlLabel value="1º Year" control={<Radio />} label="1º Year" />
        <FormControlLabel value="2º Year" control={<Radio />} label="2º Year" />
        <FormControlLabel value="3º Year" control={<Radio />} label="3º Year" />
      </RadioGroup>
    </FormControl>
  );
}
