const db = require("../config/db");


// Add Exam Name Controller===================
exports.addExamName = async (req, res) => {
  try {
    const { examName, examDate, startTime, endTime } = req.body;

    if (!examName || !examDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields (examName, examDate, startTime, endTime) are required.",
      });
    }

    const sql = `
      INSERT INTO examName (examName, examDate, startTime, endTime)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [examName, examDate, startTime, endTime]);

    return res.status(201).json({
      success: true,
      message: "Exam created successfully.",
    });
  } catch (error) {
    console.error("Error adding exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// Get All Exams
exports.allExamData = async (req, res) => {
  try {
    const sql = `SELECT * FROM examName ORDER BY examDate DESC`;
    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      message: "All exams fetched successfully.",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required.",
      });
    }

    const sql = `DELETE FROM examName WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Edit Exam
exports.editExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, examDate, startTime, endTime } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required.",
      });
    }

    if (!examName || !examDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const sql = `
      UPDATE examName 
      SET examName = ?, examDate = ?, startTime = ?, endTime = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [examName, examDate, startTime, endTime, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// Get Exam By ID
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required.",
      });
    }

    const sql = `SELECT * FROM examName WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam fetched successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching exam by id:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// exam schedule-------------------------------------------------
exports.addExamSchedule =async (req, res) => {
  try {
    const {
      className,
      section,
      examName,
      startTime,
      endTime,
      duration,
      examDate,
      subject,
      roomNo,
      maxMarks,
      minMarks,
    } = req.body;

    // ✅ Validation
    if (
      !className ||
      !section ||
      !examName ||
      !startTime ||
      !endTime ||
      !duration ||
      !examDate ||
      !subject ||
      !roomNo ||
      !maxMarks ||
      !minMarks
    ) {
      return res.status(400).json({ message: "All fields are required" ,success:false });
    }

    const sql = `
      INSERT INTO examSchedule 
      (className, section, examName, startTime, endTime, duration, examDate, subject, roomNo, maxMarks, minMarks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      className,
      section,
      examName,
      startTime,
      endTime,
      duration,
      examDate,
      subject,
      roomNo,
      maxMarks,
      minMarks,
    ];

   const [result] = await db.query(sql, values)

    return  res.status(201).json({
        message: "Exam Schedule created successfully",
        success:true
      });
    


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error"  , success:false});
  }
};

exports.allScheduleData = async (req, res) => {
  try {
    const sql = `
      SELECT 
      es.id,
        es.subject,
        es.duration,
        es.roomNo,
        es.maxMarks,
        es.minMarks,
        ed.examDate,
        et.endTime,
        st.startTime
      FROM examSchedule es
      LEFT JOIN examName ed ON es.examDate = ed.id
      LEFT JOIN examName et ON es.endTime = et.id
      LEFT JOIN examName st ON es.startTime = st.id
    `;

    const [rows] = await db.query(sql);
   return res.status(200).json({message:'All exam schedule fetched successfully !' , success:true ,data:rows});

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error!", success: false });
  }
};


// exam grade

exports.addExamGrade = async (req, res) => {
  try {
    const { grade, marksFrom, marksUpto, gradePoints, status, description } = req.body;

    // Basic validation
    if (!grade || !marksFrom || !marksUpto || !gradePoints) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided!",
      });
    }

    const sql = `
      INSERT INTO examGrade
      (grade, marksFrom, marksUpto, gradePoints, status, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [grade, marksFrom, marksUpto, gradePoints, status, description];

    const [result] = await db.query(sql, values);

    return res.status(201).json({
      success: true,
      message: "Grade added successfully!",
    });
  } catch (error) {
    console.error("Error inserting grade:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

exports.allGrades = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM examGrade ORDER BY id ASC`);
    return res.status(200).json({message:'All grade fetched successgully !', success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Fetch single grade by id
exports.getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT * FROM examGrade WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update grade
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, marksFrom, marksUpto, gradePoints, status, description } = req.body;

    const sql = `UPDATE examGrade SET 
      grade = ?, marksFrom = ?, marksUpto = ?, gradePoints = ?, status = ?, description = ? 
      WHERE id = ?`;

    const [result] = await db.query(sql, [
      grade,
      marksFrom,
      marksUpto,
      gradePoints,
      status,
      description,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({ success: true, message: "Grade updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`DELETE FROM examGrade WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({ success: true, message: "Grade deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




