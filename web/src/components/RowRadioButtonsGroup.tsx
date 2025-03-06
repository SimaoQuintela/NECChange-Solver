import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function RowRadioButtonsGroup() {
  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">Year</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="1º Year" control={<Radio />} label="1º Year" />
        <FormControlLabel value="2º Year" control={<Radio />} label="2º Year" />
        <FormControlLabel value="3º Year" control={<Radio />} label="3º Year" />
      </RadioGroup>
    </FormControl>
  );
}
