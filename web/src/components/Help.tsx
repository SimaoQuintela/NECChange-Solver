import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

interface HelpProps {
  title: string;
}

export default function Help({ title }: HelpProps) {
  const formattedTitle = title
    .replace(/(\d+\.)/g, `<strong>$&</strong>`) 
    .replace(/\n/g, "<br />"); 

  return (
    <Tooltip
      title={<span dangerouslySetInnerHTML={{ __html: formattedTitle }} />}
      slotProps={{
        tooltip: {
          sx: {
            fontSize: 17,
          },
        },
      }}
    >
      <IconButton>
        <HelpOutlineIcon style={{ color: "white" }} />
      </IconButton>
    </Tooltip>
  );
}
