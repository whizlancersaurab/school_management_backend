const db = require('../../config/db');

exports.addLeaveType = async (req, res) => {
  const { name, total_allowed, status } = req.body;

  if (!name || !total_allowed) {
    return res.status(400).json({
      message: 'Required fields must be provided!',
      success: false,
    });
  }

  try {
    // Normalize input: lowercase + remove spaces
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');

    // Check if already exists (case + space insensitive)
    const [existLeaveType] = await db.query(
      `SELECT id FROM leaves_type 
       WHERE REPLACE(LOWER(name), ' ', '') = ? LIMIT 1`,
      [normalizedName]
    );

    if (existLeaveType.length > 0) {
      return res.status(400).json({
        message: 'Leave type already exists (case/space insensitive check)!',
        success: false,
      });
    }

    // Insert new leave type
    await db.query(
      `INSERT INTO leaves_type (name, total_allowed, status) VALUES (?, ?, ?)`,
      [name, total_allowed, status || 1]
    );

    return res.status(201).json({
      message: 'Leave type added successfully!',
      success: true,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error while adding Leave type!',
      success: false,
      error: error.message,
    });
  }
};




exports.getAllLeaveTypes = async (req, res) => {
  try {
    // Exclude created_at and updated_at
    const [leaveTypes] = await db.query(
      `SELECT id, name, total_allowed, status 
       FROM leaves_type`
    );

    return res.status(200).json({
      success: true,
      data: leaveTypes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching leave types!",
      error: error.message,
    });
  }
};

