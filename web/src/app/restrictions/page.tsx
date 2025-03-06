import { useState } from "react";
import RowRadioButtonsGroup from "@/components/RowRadioButtonsGroup";

export default function Restrictions() {
  const [year, setYear] = useState(false);
  return (
    <div className="h-screen bg-slate-200 ">
      <RowRadioButtonsGroup />
    </div>
  );
}
