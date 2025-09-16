const db = require('../../config/db')
const bcrypt = require('bcryptjs')

exports.addTeacher = async (req, res) => {
  const data = req.body;
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    // 0. Check if email exists
    const [existingUser] = await connection.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [data.email]
    );

    if (existingUser.length > 0) {
      await connection.release()
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const sql1 = `
      INSERT INTO users (firstname, lastname, mobile, email, password, type_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const hashPassword = await bcrypt.hash(data.password, 10);

    const [userRes] = await connection.query(sql1, [
      data.first_name,
      data.last_name,
      data.primarycont,
      data.email,
      hashPassword,
      2,
      data.status
    ]);
    const userId = userRes.insertId;

    const sql2 = `
      INSERT INTO teachers (
        user_id, teacher_id, class, subject, gender, blood_gp, date_of_join, 
        fat_name, mot_name, dob, mari_status, lan_known, qualification, 
        work_exp, prev_school, prev_school_addr, prev_school_num, address, 
        perm_address, pan_or_id, other_info ,facebook_link ,instagram_link,linked_link,twitter_link , 
        img_src , resume_src , letter_src
      ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?,?,?,?,?,?,?)
    `;
    await connection.query(sql2, [
      userId,
      data.teacher_id,
      data.class,
      data.subject,
      data.gender,
      data.blood_gp,
      data.date_of_join,
      data.fat_name,
      data.mot_name,
      data.dob,
      data.mari_status,
      data.lan_known,
      data.qualification,
      data.work_exp,
      data.prev_school,
      data.prev_school_addr,
      data.prev_school_num,
      data.address,
      data.perm_address,
      data.pan_or_id,
      data.other_info,
      data.facebook_link,
      data.instagram_link,
      data.linked_link,
      data.twitter_link,
      data.img_src,
      data.resume_src,
      data.letter_src
    ]);

    const sql3 = `
      INSERT INTO teacher_payroll_info 
      (user_id ,epf_no , basic_salary , contract_type , work_sift , work_location , date_of_leave)   
      VALUES (?,?,?,?,?,?,?)
    `;
    await connection.query(sql3, [
      userId, data.epf_no, data.basic_salary, data.contract_type, 
      data.work_sift, data.work_location, data.date_of_leave
    ]);

    const sql4 = `
      INSERT INTO teacher_leaves 
      (user_id, medical_leaves, casual_leaves, maternity_leaves, sick_leaves) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(sql4, [
      userId,
      data.medical_leaves,
      data.casual_leaves,     
      data.maternity_leaves,
      data.sick_leaves
    ]);

    // bank details
    const sqlb = `
      INSERT INTO teacher_bank_info 
      (user_id , account_name,account_num,bank_name,ifsc_code,branch_name) 
      VALUES (?,?,?,?,?,?)
    `;
    await connection.query(sqlb, [
      userId, data.account_name ,data.account_num,data.bank_name,data.ifsc_code,data.branch_name
    ]);

    // transport data
    const sql5 = `
      INSERT INTO teacher_transport_info 
      (user_id , route , vehicle_num ,pickup_point) 
      VALUES(?,?,?,?)
    `;
    await connection.query(sql5, [
      userId, data.route, data.vehicle_num, data.pickup_point
    ]);

    // hostel data
    const sql6 = `
      INSERT INTO teacher_hostel_info 
      (user_id , hostel , room_num) 
      VALUES(?,?,?)
    `;
    await connection.query(sql6, [
      userId, data.hostel, data.room_num
    ]);
     
    await connection.commit()
    await connection.release()

    return res.status(201).json({
      message: "Teacher added successfully",
      success: true
    });

  } catch (error) {
    await connection.rollback()
    await connection.release()
  
    console.error("Error adding teacher:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false
    });
  }
};


exports.allTeachers = async (req, res) => {
  try {
    const sql = `
      SELECT  
        t.id,
        t.user_id,
        t.teacher_id,
        t.class,
        t.subject,
        t.date_of_join,
        t.img_src, 
        u.firstname,
        u.lastname,
        u.status,
        u.mobile,
        u.email
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id 
    `;

    const [rows] = await db.query(sql); // ✅ MySQL2 query
    return res.status(200).json({
      success: true,
      message: "All teachers fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};


exports.speTeacher= async (req, res) => {
  const {userId} = req.params;
  try {
    const sql = `
      SELECT  
        t.id,
        t.user_id,
        t.teacher_id,
        t.class,
        t.subject,
        t.gender,
        t.blood_gp,
        t.date_of_join,
        t.fat_name,
        t.mot_name,
        t.dob,
        t.mari_status,
        t.lan_known,
        t.qualification,
        t.work_exp,
        t.prev_school,
        t.prev_school_addr,
        t.prev_school_num,
        t.address,
        t.perm_address,
        t.pan_or_id,
        t.other_info,
        t.facebook_link,
        t.instagram_link,
        t.linked_link,
        t.twitter_link,
        t.img_src,
        t.resume_src,
        t.letter_src,
        u.firstname,
        u.lastname,
        u.status,
        u.mobile,
        u.email,
        b.account_name,
        b.account_num,
        b.bank_name,
        b.ifsc_code,
        b.branch_name,
        h.hostel,
        h.room_num,
        tp.route,
        tp.vehicle_num,
        tp.pickup_point,
        pi.contract_type,
        pi.work_sift,
        pi.work_location
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN teacher_bank_info b ON t.user_id =b.user_id
      LEFT JOIN teacher_hostel_info h ON t.user_id = h.user_id
      LEFT JOIN teacher_transport_info tp ON t.user_id =tp.user_id  
      LEFT JOIN teacher_payroll_info pi ON t.user_id = pi.user_id
      WHERE t.user_id=?
    `;

    const [rows] = await db.query(sql ,[userId]); // ✅ MySQL2 query
    return res.status(200).json({
      success: true,
      message: "All teachers fetched successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};

exports.allTeachersForOption= async (req, res) => {
  try {
    const sql = `
      SELECT      
        t.user_id AS id,
        t.teacher_id,
        u.firstname,
        u.lastname
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
    `;

    const [rows] = await db.query(sql); // ✅ MySQL2 query
    return res.status(200).json({
      success: true,
      message: "All teachers fetched successfully For option",
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};
