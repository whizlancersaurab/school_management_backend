const db = require('../config/db')

exports.addTimeTable = async (req, res) => {
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()
    const data = req.body;

    const sql = `INSERT INTO timetable (day,class, section, subject, teacher, timefrom, timeto) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`

    const [result] = await connection.query(sql, [
         data.day,
      data.class,
      data.section,
      data.subject,
      data.teacher,
      data.timefrom,
      data.timeto,
     
    ])

    
    await connection.commit()

    return res.status(201).json({
      message: "Timetable entry added successfully",
      success: true,
      timetableId: result.insertId
    })

  } catch (error) {
    await connection.rollback() 
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message })
  } finally {
    connection.release() 
  }
}

exports.getTimeTable = async (req, res) => {
  try {

    // aage future me esi ka use akrenge jab espe kam akrenge tb
    //  const sql = `SELECT 
    //              tt.id,
    //              tt.day,
    //              tt.teacher,
    //              tt.class,
    //              tt.section,
    //              tt.subject,
    //              tt.timeto,
    //              tt.timefrom,
    //              t.img_src,
    //              u.firstname,
    //              u.lastname
    //              FROM timetable tt
    //              LEFT JOIN teachers t ON tt.teacher = t.user_id
    //              LEFT JOIN users u ON tt.teacher =u.id
    
    //      `
  
    // 2️⃣ Get timetable for that class + section
    // const [timetableRows] = await db.query(`SELECT * FROM timetable ORDER BY day, timefrom`);
    const [timetableRows] = await db.query(`SELECT * FROM timetable ORDER BY day, timefrom`);

   
    return res.status(200).json({
      success: true,
      timetable: timetableRows,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
