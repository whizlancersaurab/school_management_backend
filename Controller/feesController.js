const db = require('../config/db')



exports.stuDetForFees = async (req, res) => {
  const { id } = req.params;

  try {
    // Get student data
    const [studentRows] = await db.query(
      "SELECT stu_id, class, section, stu_img FROM students WHERE id = ?",
      [id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found", success: false });
    }

    const studentData = studentRows[0];

    // Get user details (name)
    const [userRows] = await db.query(
      "SELECT firstname, lastname FROM users WHERE id = ?",
      [studentData.stu_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const userData = userRows[0];

    // Final student object
    const student = {
      class: studentData.class,
      section: studentData.section,
      img: studentData.stu_img,
      name: `${userData.firstname} ${userData.lastname}`,
    };

    return res.status(200).json({
      message: "Student fetched successfully!",
      success: true,
      student,
    });
  } catch (error) {
    console.error("stuDetForFees error:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};


// add groupname----------------------------------

exports.AddFeesGroupName = async (req, res) => {

  const { description, feesGroup, status } = req.body;

  if (!description || !feesGroup) {
    return res.status(403).json({ message: 'Required fileds are mandatory !', success: false })
  }

  try {

    const sql = `INSERT INTO fees_group (feesGroup , description , status) VALUES (?,?,?)`

    const [result] = await db.query(sql, [feesGroup, description, status])

    return res.status(200).json({ message: 'Fees group added sucessfully !', success: true })

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error !', success: false })
  }
}

exports.AllFeesFormGroup = async (req, res) => {
  try {
    const [feesGroups] = await db.query(`SELECT * FROM fees_group`);
    return res.status(200).json({
      message: "All fees groups data!",
      success: true,
      feesGroups,
    });
  } catch (error) {
    console.error("AllFeesFormGroup error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};



exports.UpdateFeesGroup = async (req, res) => {
  const { id } = req.params;
  const { description, feesGroup, status } = req.body;

  // agar ek bhi field na bheja ho
  if (!description && !feesGroup && status === undefined) {
    return res.status(400).json({
      message: "At least one field is required to update!",
      success: false,
    });
  }

  try {
    // Dynamic fields collect karo
    let fields = [];
    let values = [];

    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (feesGroup !== undefined) {
      fields.push("feesgroup = ?");
      values.push(feesGroup);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }

    values.push(id); // last me id

    const sql = `UPDATE fees_group SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Fees group not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Fees group updated successfully!",
      success: true,
    });
  } catch (error) {
    console.error("UpdateFeesGroup error:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};



exports.DeleteFeesGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM fees_group WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Fees group not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "Fees group deleted successfully!", success: true });
  } catch (error) {
    console.error("DeleteFeesGroup error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};


exports.GetFeesGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `SELECT * FROM fees_group WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Fees group not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Fees group fetched successfully!",
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GetFeesGroupById error:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};

// add fees type--------------------------------------



// ➝ Add new Fees Type
exports.AddFeesTypeName = async (req, res) => {
  const { description, feesGroup, name, status } = req.body;

  if (!description || !feesGroup || !name) {
    return res
      .status(403)
      .json({ message: "Required fields are mandatory!", success: false });
  }

  try {
    const sql = `INSERT INTO fees_type (name, feesGroupId, description, status) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(sql, [name, feesGroup, description, status]);

    return res
      .status(200)
      .json({ message: "Fees Type added successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};

// ➝ Get all Fees Types
exports.AllFeesTypes = async (req, res) => {
  try {
    const [feesTypes] = await db.query(`
      SELECT ft.id, ft.name , ft.description, ft.status, fg.feesGroup 
      FROM fees_type ft
      LEFT JOIN fees_group fg ON ft.feesGroupId = fg.id
    `);

    return res
      .status(200)
      .json({ message: "All fees types data!", success: true, feesTypes });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};

// ➝ Get Fees Type by ID
exports.GetFeesTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [feesType] = await db.query(
      `SELECT * FROM fees_type WHERE id = ?`,
      [id]
    );

    if (feesType.length === 0) {
      return res
        .status(404)
        .json({ message: "Fees type not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "Fees type fetched!", success: true, data: feesType[0] });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};

// ➝ Update Fees Type (any field)
exports.UpdateFeesType = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, feesGroup } = req.body;

  try {
    // Dynamically update only provided fields
    let fields = [];
    let values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (description) {
      fields.push("description = ?");
      values.push(description);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    if (feesGroup) {
      fields.push("feesGroupId = ?");
      values.push(feesGroup);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update!",
        success: false,
      });
    }

    const sql = `UPDATE fees_type SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const [result] = await db.query(sql, values);

    return res
      .status(200)
      .json({ message: "Fees type updated successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};

// ➝ Delete Fees Type
exports.DeleteFeesType = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM fees_type WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Fees type not found!", success: false });
    }

    return res
      .status(200)
      .json({ message: "Fees type deleted successfully!", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};



// add master types -----------------------------------------------

exports.AddFeesMaster = async (req, res) => {
  try {
    const {
      amount,
      dueDate,
      feesGroup,
      feesType,
      fineType,
      fixedAmount,
      percentage,
      percentageAmount,
      status,
      totalAmount,
      fineAmount,
    } = req.body;
    console.log(req.body)

    // Validation
    if (!amount || !dueDate || !feesGroup || !feesType) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const sql = `
      INSERT INTO fees_master 
      (amount, dueDate, feesGroup, feesType, fineType, fixedAmount, percentage, percentageAmount, status, totalAmount, fineAmount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      amount,
      dueDate,
      feesGroup,
      feesType,
      fineType || "",
      fixedAmount || "0",
      percentage || "0",
      percentageAmount || "0",
      status || "0",
      totalAmount || amount,
      fineAmount
    ];

    const [feesMasterRes] = await db.query(sql, values)

    return res.status(201).json({ message: 'Master fees added successfully !', success: true })

  } catch (error) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.AllFeesMaster = async (req, res) => {
  try {
    const sql = `
      SELECT 
        fm.id,
        fm.amount,
        fm.dueDate,
        fm.fineType,
        fm.status,
        fm.fineAmount,
        fm.totalAmount,
        fg.feesGroup,
        ft.name AS feesType
      FROM fees_master fm
      LEFT JOIN fees_group fg ON fm.feesGroup = fg.id
      LEFT JOIN fees_type ft ON fm.feesType = ft.id
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      message: "All fees masters",
      success: true,
      fees_master: rows,
    });
  } catch (error) {
    console.log("❌ DB Error:", error.message);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
    });
  }
};


// fees assign-----------------------------------------------------
exports.feesAssignToStudent = async (req, res) => {
  try {
    const payload = req.body;
    const studentLengts = payload.length;
    // Example: [{ rollnum: "3453453", fees: [18,19,20]}, { rollnum: "101", fees:[18,21]}]

    for (const student of payload) {
      for (const feeId of student.fees) {
        await db.query(
          "INSERT INTO fees_assign (student_rollnum, fees_masterId) VALUES (?, ?)",
          [student.rollnum, feeId]
        );
      }
    }

    return res.status(200).json({ message: `Fees assigned to ${studentLengts} students successfully `, success: true })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server errror !', success: false })
  }
}


// exports.getFeesDeatilSpecificStudent = async (req, res) => {
//   try {
//     const { rollnum } = req.params;

//     const [rows] = await db.query(
//       `SELECT f.TotalAmount, f.dueDate,
//               fg.feesGroup AS feesGroupName,
//               fg.id AS feesGroupId,
//               ft.name AS feesTypeName,
//               ft.id AS feesTypeId,
//               sfa.fees_masterId       
//        FROM fees_master f
//        JOIN fees_assign sfa ON f.id = sfa.fees_masterid
//        JOIN fees_group fg ON f.feesGroup = fg.id
//        JOIN fees_type ft ON f.feesType = ft.id
//        WHERE sfa.student_rollnum = ?`,
//       [rollnum]
//     );

//     return res.status(200).json({ message: 'Specific student fees details ', rows })
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error", success: false });
//   }
// };


exports.getFeesDeatilsSpecStudent = async (req, res) => {
  const { rollnum } = req.params;



  try {
    const sql = `
      SELECT 
        sfa.id,
        sfa.assigned_date,
        sfa.AmountPay,
        sfa.collectionDate,
        sfa.PayementType AS mode,
        sfa.paymentRefno,
        sfa.status,
        sfa.discount,
        fm.fineAmount AS fine,
        fm.dueDate,
        fg.feesGroup,
        ft.name AS feesType,
        st.class
        FROM fees_assign sfa
        LEFT JOIN fees_master fm ON fm.id = sfa.fees_masterId
        LEFT JOIN fees_group fg ON fm.feesGroup = fg.id
        LEFT JOIN fees_type ft ON fm.feesType = ft.id
        LEFT JOIN students st ON sfa.student_rollnum = st.rollnum    
        WHERE sfa.student_rollnum = ? AND sfa.status='1'
    `;

    const [rows] = await db.query(sql, [rollnum]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No fee records found for student_rollnum: ${rollnum}`,
        feesdata: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fee details fetched successfully",
      feesdata: rows
    });

  } catch (error) {
    console.error("❌ Error fetching fee details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


// assign details
exports.allAssignDetails = async (req, res) => {
  try {
    const sql = `
      SELECT 
          fg.feesGroup AS feesGroup,
          ft.name AS feesType,
          st.class,
          st.section,
          st.gender,
          st.category,
          fm.totalAmount AS amount
      FROM fees_assign fa
      JOIN students st ON fa.student_rollnum = st.rollnum
      JOIN fees_master fm ON fm.id = fa.fees_masterId
      JOIN fees_group fg ON fg.id = fm.feesGroup
      JOIN fees_type ft ON ft.id = fm.feesType
      GROUP BY fg.feesGroup, ft.name, st.class, st.section, st.gender, st.category
      ORDER BY fg.feesGroup, ft.name, st.class, st.section
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      message: "All assigned details",
      success: true,
      assignDetails: rows
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false
    });
  }
};


// fees submit
exports.feesSubmit = async (req, res) => {
  const data = req.body;

  try {
    const {
      student_rollnum,
      feesGroup,
      feesType,
      amount,
      collectionDate,
      paymentType,
      paymentRef,
      notes
    } = data;

    // ✅ Query (only student_rollnum basis)
    const query = `
      UPDATE fees_assign
      SET 
        fees_groupId = ?,
        fees_typeId = ?,
        AmountPay = ?,
        collectionDate = ?,
        PayementType = ?,
        paymentRefno = ?, 
        Notes = ?,
        status = '1',
        updated_date = NOW()
      WHERE student_rollnum = ?
    `;

    // ✅ Values (no extra conditions at end)
    const values = [
      feesGroup,
      feesType,
      amount,
      collectionDate,
      paymentType,
      paymentRef,
      notes,
      student_rollnum   // only condition
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "✅ Fees record updated successfully!",
        success: true
      });
    } else {
      return res.status(404).json({
        message: "⚠️ No record found for this student_rollnum!",
        success: false
      });
    }
  } catch (error) {
    console.error("❌ DB Error:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false
    });
  }
};


// collection  paid and unpaid fees
exports.getFeesCollection = async (req, res) => {

  try {
    const sql = `
      SELECT 
        sfa.id,
        sfa.student_rollnum,
        sfa.status,
        fm.dueDate,
        fm.totalAmount,
        st.admissionnum AS admNo,
        st.class,
        st.section,
        st.stu_img,
        st.stu_id,
        us.firstname,
        us.lastname
        FROM fees_assign sfa
        LEFT JOIN fees_master fm ON fm.id = sfa.fees_masterId
        LEFT JOIN students st ON sfa.student_rollnum = st.rollnum 
        LEFT JOIN users us ON st.stu_id = us.id  
        ORDER BY sfa.id ASC 
    `;

    const [rows] = await db.query(sql);


    return res.status(200).json({
      success: true,
      message: "Collection details fetched successfully",
      feesdata: rows
    });

  } catch (error) {
    console.error(" Error fetching fee details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


















