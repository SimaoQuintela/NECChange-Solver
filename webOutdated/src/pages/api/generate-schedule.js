import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  const scriptPath = path.join(process.cwd(), "../schedule/schedule/main.py");

  exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return res.status(500).json({ error: "Execution error", details: stderr });
    }

    console.log("main.py executed successfully");
    console.log(stdout.trim());
    return res.status(200).json({ message: "Execution completed", output: stdout.trim() });
  });
}
