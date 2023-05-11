import schedule from "public/data/schedule.json"

export default function handler(req, res) {
  const data = req.query;
  const uc = data.uc;
  const type_class = data.type_class

  const shifts = schedule.filter((e) => (e.uc === uc) && (e.type_class === type_class))
                         .map((e) => e.type_class + e.shift)
                         .sort()

  res.status(200).json({"shifts":shifts})
}