import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import { EventCalendarI } from "@/types/Types";
import axios from "axios";

interface PopUpProps {
  event: EventCalendarI;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PopUp({ event, open, setOpen }: PopUpProps) {
  const [newCapacity, setNewCapacity] = React.useState(event.capacity || 0);

  const handleClose = () => {
    setOpen(false);
    setNewCapacity(event.capacity || 0);
  };

  const handleChange = (value: number) => {
    setNewCapacity(value);
  };

  const handleSave = async () => {
    const key = `${event.uc}-${event.type_class}-${event.shift}-${event.room}`;
    const dados = { [key]: newCapacity };

    try {
      await axios.post("/api/dynamicAlocation", dados);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
    >
      <DialogTitle id="alert-dialog-title">Change Event Capacity</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Change capacity from {event.capacity} to:
        </Typography>

        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          Capacity
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          border="1px solid #ccc"
          borderRadius="8px"
          overflow="hidden"
          width="fit-content"
          padding="4px 8px"
        >
          <IconButton
            onClick={() => handleChange(newCapacity - 1)}
            disabled={newCapacity <= 0}
          >
            <RemoveIcon />
          </IconButton>

          <input
            type="number"
            value={newCapacity}
            onChange={(e) => handleChange(parseInt(e.target.value, 10) || 0)}
            style={{
              textAlign: "center",
              border: "none",
              outline: "none",
              appearance: "textfield",
            }}
          />

          <IconButton
            onClick={() => handleChange(newCapacity + 1)}
            disabled={newCapacity >= (event.capacity || 0)}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
