import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  const scriptPath = path.join(
    process.cwd(),
    "../schedule/schedule/export_year_schedule.py"
  );

  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`An error occurred during execution: ${error}`);
      res.status(500).json({ error: "An error occurred during execution" });
    } else {
      console.log("export_year_schedule executed successfully");
      res
        .status(200)
        .json({ message: "export_year_schedule executed successfully" });
    }
  });
}
