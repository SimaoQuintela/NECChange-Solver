import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  const scriptPath = path.join(process.cwd(), "../schedule/schedule/main.py");

  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`An error occurred during execution: ${error}`);
      res.status(500).json({ error: "An error occurred during execution" });
    } else {
      console.log("main.py executed successfully");
      res.status(200).json({ message: "main.py executed successfully" });
    }
  });
}
