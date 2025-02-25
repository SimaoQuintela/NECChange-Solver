import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { StudentsNumberType } from '@/types/Types';


interface InputAutoProps {
  label: string;
  options: string[];
  setStudent: (value: StudentsNumberType) => void;
}

export default function InputAuto({ label, options = [], setStudent }: InputAutoProps) {
  return (
    <Autocomplete
      freeSolo
      id="free-solo-2-demo"
      disableClearable
      options={options}
      onInputChange={(_, newValue) => setStudent(newValue as StudentsNumberType)} 
      onChange={(_, newValue) => setStudent((newValue || "") as StudentsNumberType)} 
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{
            input: {
              ...params.InputProps,
              type: 'search',
            },
          }}
        />
      )}
    />
  );
}
