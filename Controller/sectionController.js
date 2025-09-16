const db = require('../config/db');

// ✅ Get all sections
exports.allSection = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id,section,status FROM classSection`);
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};

// ✅ Add new section
exports.addSection = async (req, res) => {
  const data = req.body;
  try {
    if(!data.section || !data.status){
        return res.status(403).json({message:'All fields must be required !' , success:false})
    }

    const [result] = await db.query(
      `INSERT INTO classSection(section, status) VALUES (?, ?)`,
      [data.section, data.status]
    );

    res.status(201).json({
      success: true,
      message: "Section added successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add section",
      error: error.message,
    });
  }
};

// ✅ Edit/update specific section
exports.editSpecificSection = async (req, res) => {
  const { id } = req.params;
  const { section, status } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE classSection SET section = ?, status = ? WHERE id = ?`,
      [section, status, id]
    );

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update section",
      error: error.message,
    });
  }
};

// ✅ Delete section
exports.deleteSection = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(`DELETE FROM classSection WHERE id = ?`, [
      id,
    ]);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete section",
      error: error.message,
    });
  }
};

// ✅ Get section by ID
exports.getSectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM classSection WHERE id = ?`, [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch section",
      error: error.message,
    });
  }
};
