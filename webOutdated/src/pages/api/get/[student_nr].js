import alocation from "public/data/alocation.json"

export default function handler(req, res) {
  const student = req.query

  try{
    if(Object.keys(alocation).includes(student.student_nr)){
      //console.log(alocation[student.student_nr])
      let classes = alocation[student.student_nr]
      res.status(200).json({"classes": classes}) 
    } else {
      res.status(404).json({"Error": "Not Found"})
    }  
  } catch (err){
    throw(err)
  }
  
  
}