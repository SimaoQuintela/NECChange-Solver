import { spawn } from "child_process";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { stdout, stderr } = await runScript();
    if (stderr) {
      console.error(stderr);
      res.status(500).send(stderr);
    } else {
      console.log(stdout);
      res.status(200).send(stdout);
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

function runScript() {
  return new Promise((resolve) => {
    const scriptExecution = spawn("python", ["../schedule/schedule/main.py"]);
    let stdout = "";
    let stderr = "";
    scriptExecution.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    scriptExecution.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    scriptExecution.on("close", () => {
      resolve({ stdout, stderr });
    });
  });
}
