const db = require('../config/db');

// Add subject
exports.addSubject = async (req, res) => {
  const data = req.body;

  try {
    // Insert into DB
    const [subject_res] = await db.query(
      `INSERT INTO class_subject (name, code, type, status) VALUES (?,?,?,?)`,
      [data.name, data.code, data.type, data.status]
    );

    return res.status(201).json({
      message: "Subject added successfully!",
      success: true,
      subjectId: subject_res.insertId, 
    });
  } catch (error) {
    console.error("Error in addSubject:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};

// Get all subjects
exports.allSubject = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id,name,code,type,status FROM class_subject ORDER BY id DESC`);

    return res.status(200).json({
      message: "All subjects fetched successfully!",
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error in allSubject:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};
