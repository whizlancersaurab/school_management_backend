const db = require("../../config/db");

// ✅ Create
exports.addClass = async (req, res) => {
  const { className, section, noOfStudents, noOfSubjects, status } = req.body;

  try {
    if (!className || !section || !noOfStudents || !noOfSubjects) {
      return res
        .status(403)
        .json({ message: "All fields are required!", success: false });
    }

    const sql = `INSERT INTO classes (className, section, noOfStudents, noOfSubjects, status) VALUES (?, ?, ?, ?, ?)`;
    await db.query(sql, [
      className,
      section,
      noOfStudents,
      noOfSubjects,
      status,
    ]);

    return res
      .status(201)
      .json({ message: "Class added successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while adding class!", success: false });
  }
};

// ✅ Read All
exports.getClasses = async (req, res) => {
  try {
    const sql = `SELECT * FROM classes`;
    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while fetching classes!", success: false });
  }
};

// ✅ Read Single
exports.getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `SELECT * FROM classes WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Class not found!", success: false });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while fetching class!", success: false });
  }
};

// ✅ Update
exports.updateClass = async (req, res) => {
  const { id } = req.params;
  const { className, section, noOfStudents, noOfSubjects, status } = req.body;

  try {
    const sql = `UPDATE classes SET className=?, section=?, noOfStudents=?, noOfSubjects=?, status=? WHERE id=?`;
    const [result] = await db.query(sql, [
      className,
      section,
      noOfStudents,
      noOfSubjects,
      status,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Class not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "Class updated successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while updating class!", success: false });
  }
};

// ✅ Delete
exports.deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM classes WHERE id=?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Class not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "Class deleted successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while deleting class!", success: false });
  }
};
