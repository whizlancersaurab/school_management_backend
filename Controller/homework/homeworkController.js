const db = require('../../config/db');

exports.addHomeWork = async (req, res) => {
  try {
    const {
        // class is a reserver keyword so i use classname instaed of class
      className,
      section,
      subject,
      homeworkDate,
      submissionDate,
      attachments,
      description,
      status,
      teacherId,
    } = req.body;

    // ✅ Validation
    if (!className || !section || !subject || !homeworkDate || !submissionDate || !description) {
      return res.status(400).json({ message: "All required fields must be provided" ,success:false});
    }

    const sql = `
      INSERT INTO home_work 
      (className, section, subject, homeworkDate, submissionDate, attachements, description, status, teacherId, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      className,
      section,
      subject,
      homeworkDate,
      submissionDate,
      attachments || null,
      description,
      status || "1",
      teacherId,
    ];

    const [result] = await db.query(sql, values);

    return res.status(201).json({
      message: `Homework added successfully to class ${className}-${section}`,
      homeworkId: result.insertId,
      success:true
    });
  } catch (error) {
    console.error("Error adding homework:", error);
    return res.status(500).json({ message: "Internal Server Error" , success:false });
  }
};

exports.allHomewrok = async(req,res)=>{


    try {

        const sql = `SELECT 
            hw.id,
            hw.section,
            hw.className,
            hw.subject,
            hw.homeworkDate,
            hw.submissionDate,
            t.img_src,
            t.user_id,
            u.firstname,
            u.lastname
            FROM home_work hw
            LEFT JOIN teachers t ON hw.teacherId =t.teacher_id
            LEFT JOIN users u ON t.user_id = u.id
                
        `
        const [rows] = await db.query(sql)
        return res.status(200).json({message:'Fetched all homw works successfully !' , success:true,data:rows})

    } catch (error) {
        console.log(error)
         return res.status(500).json({message:'Error while fetching all homewroks !' , success:false})
    }
}
