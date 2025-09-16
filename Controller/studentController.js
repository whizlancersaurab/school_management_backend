
const db = require('../config/db')
const bcrypt = require('bcryptjs');
const transporter = require('../utils/sendEmail')


// Generate random password and hash it
function generateRandomPassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!&";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}



// add student
exports.addStudent = async (req, res) => {
  const data = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 0. Check if email exists
    const [existingUser] = await connection.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [data.email]
    );

    if (existingUser.length > 0) {
      await connection.release();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }


    const genPassword = generateRandomPassword();
    const hashPassword = await bcrypt.hash(genPassword, 10);

    // 1. Insert into users table
    const sql1 = `
      INSERT INTO users (firstname, lastname, mobile, email, password, type_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [userRes] = await connection.query(sql1, [
      data.firstname,
      data.lastname,
      data.primarycont,
      data.email,
      hashPassword,
      3,
      data.status,
    ]);
    const userId = userRes.insertId;

    // 2. Insert into students table
    const sql2 = `
      INSERT INTO students (
        stu_id, academicyear, admissionnum, admissiondate, rollnum, class, section, gender, dob, bloodgp, house,
        religion, category, caste, motherton, lanknown, stu_img , curr_address , perm_address, prev_school , prev_school_address ,
        medicalcert, transfercert, stu_condition ,allergies, medications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)
    `;


    await connection.query(sql2, [
      userId,
      data.academicyear,
      data.admissionnum,
      data.admissiondate,
      data.rollnum,
      data.class,
      data.section,
      data.gender,
      data.dob,
      data.bloodgp,
      data.house,
      data.religion,
      data.category,
      data.caste,
      data.motherton,
      Array.isArray(data.lanknown) ? JSON.stringify(data.lanknown) : data.lanknown,
      data.stuimg,
      data.curr_address,
      data.perm_address,
      data.prev_school,
      data.prev_school_address,
      data.medicalcert,
      data.transfercert,
      data.condition,
      Array.isArray(data.allergies) ? JSON.stringify(data.allergies) : data.allergies,
      Array.isArray(data.medications) ? JSON.stringify(data.medications) : data.medications,
    ]);



    // updating files status 
    const imageFiles = [
      data.stuimg,
      data.fatimg,
      data.motimg,
      data.guaimg,
      data.medicalcert,
      data.transfercert
    ];

    for (const elem of imageFiles) {
      if (!elem) continue;
      // console.log(elem)

      const [rows] = await connection.query(
        "SELECT id FROM files WHERE filename = ?",
        [elem]
      );


      if (rows.length > 0) {
        await connection.query(
          "UPDATE files SET status = ? WHERE filename = ?",
          ["1", elem]
        );
      }
    }




    // 3. Insert into parents_info table
    const sql3 = `
      INSERT INTO parents_info (
        user_id, name, email, phone_num, occuption, relation, relation_det, address, img_src, guardian_Is
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const parentsData = [
      {
        relation: "Father",
        name: data.fat_name,
        email: data.fat_email,
        phone_num: data.fat_phone,
        occuption: data.fat_occu,
        relation_det: "",
        address: "",
        img_src: data.fatimg,
        guardian_Is: "",
      },
      {
        relation: "Mother",
        name: data.mot_name,
        email: data.mot_email,
        phone_num: data.mot_phone,
        occuption: data.mot_occu,
        relation_det: "",
        address: "",
        img_src: data.motimg,
        guardian_Is: "",
      },
      {
        relation: "Guardian",
        name: data.gua_name,
        email: data.gua_email,
        phone_num: data.gua_phone,
        occuption: data.gua_occu,
        relation_det: data.gua_relation || "",
        address: data.gua_address || "",
        img_src: data.guaimg,
        guardian_Is: data.guardianIs || "",
      },
    ];

    for (const parent of parentsData) {
      if (!parent.name) continue;
      await connection.query(sql3, [
        userId,
        parent.name,
        parent.email,
        parent.phone_num,
        parent.occuption,
        parent.relation,
        parent.relation_det,
        parent.address,
        parent.img_src,
        parent.guardian_Is,
      ]);
    }

    // hostel data
    const sql4 = `INSERT INTO hostel_info (user_id , hostel , room_num) VALUES(?,?,?)`;
    await connection.query(sql4, [userId, data.hostel, data.room_num]);

    // transport data
    const sql5 = `INSERT INTO transport_info (user_id , route , vehicle_num ,pickup_point) VALUES(?,?,?,? )`;
    await connection.query(sql5, [userId, data.route, data.vehicle_num, data.picup_point]);

    // other info
    const sql6 = `INSERT INTO other_info (user_id , bank_name , branch , ifsc_num , other_det) VALUES (?,?,?,?,?)`;
    await connection.query(sql6, [userId, data.bank_name, data.branch, data.ifsc_num, data.other_det]);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: `${data.email}`,
      subject: "Your student account has been created successfully",
      text: `
              Hello ${data.firstname},
                   Your student account has been created successfully.

                  Email: ${data.email}
                  Password: ${genPassword}
                  Please login and change your password after first login.
    `
    });


    // Commit transaction
    await connection.commit();
    await connection.release();

    return res.status(200).json({
      message: "Student added successfully!",
      success: true,
      generatedPassword: genPassword,
    });
  } catch (error) {
    await connection.rollback();
    await connection.release();
    console.error("Add student error:", error);
    return res.status(500).json({ message: "Internal server error!", success: false });
  }
};




exports.allStudents = async (req, res) => {
  try {
    const sql = `
            SELECT 
                u.id AS user_id,
                u.firstname,
                u.lastname,
                u.mobile,
                u.email,
                u.type_id,
                u.status,
                s.id AS student_id,
                s.stu_id,
                s.academicyear,
                s.admissionnum,
                s.admissiondate,
                s.rollnum,
                s.class,
                s.section,
                s.gender,
                s.dob,
                s.bloodgp,
                s.house,
                s.religion,
                s.category,
                s.caste,
                s.motherton,
                s.lanknown,
                s.stu_img
            FROM users u
            RIGHT JOIN students s
                ON u.id = s.stu_id
                WHERE u.type_id=3
        `;

    const [students] = await db.query(sql);

    res.status(200).json({
      message: "Students fetched successfully",
      success: true,
      students
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error!', success: false });
  }
};


exports.specificDetailsStu = async (req, res) => {
  const id = req.params.id;
  try {

    const sql = `
      SELECT 
        u.id AS user_id,
        u.firstname,
        u.lastname,
        u.status,
        u.mobile,
        u.email,
        s.id AS student_id,
        s.academicyear,
        s.admissionnum,
        s.admissiondate,
        s.rollnum,
        s.class,
        s.section,
        s.gender,
        s.dob,
        s.bloodgp,
        s.religion,
        s.caste,
        s.house,
        s.stu_img,
        s.category,
        s.motherton,
        s.lanknown,
        s.curr_address,
        s.perm_address,
        s.allergies,
        s.medications,
        s.prev_school,
        s.prev_school_address,
        s.medicalcert,
        s.transfercert,
        h.hostel,
        h.room_num,
        t.route,
        t.vehicle_num,
        t.pickup_point,
        o.bank_name,
        o.branch,
        o.ifsc_num,
        o.other_det
      FROM users u
      LEFT JOIN students s ON u.id = s.stu_id
      LEFT JOIN hostel_info h ON s.stu_id = h.user_id
      LEFT JOIN transport_info t ON s.stu_id = t.user_id
      LEFT JOIN other_info o ON s.stu_id=o.user_id
      WHERE u.id = ?;
    `;
    const sql2 = `SELECT id,name,email,phone_num , relation ,img_src,guardian_is FROM parents_info WHERE user_id=?`

    const [student] = await db.query(sql, [id]);
    const [parents] = await db.query(sql2, [id])

    return res.status(200).json({
      message: 'Student fetched successfully!',
      success: true,
      student: student[0] || null,
      parents: parents || []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false,
    });
  }
};




exports.deleteStu = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM students WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found', success: false });
    }

    return res.json({ message: 'Student deleted successfully', success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error!', success: false });
  }
};


// student time table 

exports.getTimeTable = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get student class & section
    const [studentRows] = await db.query(
      `SELECT class, section FROM students WHERE stu_id = ?`,
      [id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentRows[0]; // ✅ Correct way

    // 2️⃣ Get timetable for that class + section
    const [timetableRows] = await db.query(
      `SELECT * FROM timetable WHERE class = ? AND section = ? ORDER BY day, timefrom`,
      [student.class, student.section]
    );

    if (timetableRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this student",
      });
    }

    // 3️⃣ Send response
    return res.status(200).json({
      success: true,
      // student: {
      //   id,
      //   class: student.class,
      //   section: student.section,
      // },
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

// leave for students --------------------------------------------------------------------

// add leave
exports.addStudentLeave = async (req, res) => {
  const data = req.body;

  try {

    const sql = `
      INSERT INTO leave_application 
      (student_rollnum, leave_type_id, from_date, to_date, leave_day_type, no_of_days, reason, leave_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [leaveres] = await db.query(sql, [
      data.student_rollnum,
      data.leave_type_id,
      data.from_date,
      data.to_date,
      data.leave_day_type,
      data.no_of_days,
      data.reason,
      data.leave_date,
    ]);

    return res.status(201).json({
      message: "Leave applied successfully!",
      success: true,
      insertId: leaveres.insertId,
    });
  } catch (error) {
    console.error("Error in addStudentLeave:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// get leave name  , total , used and avilable

exports.getStuLeaveData = async (req, res) => {
  const { rollnum } = req.params;
  try {

    const sql = `
      SELECT 
        lt.id,
        lt.name, 
        lt.total_allowed,
        IFNULL(SUM(la.no_of_days), 0) AS used,
        (lt.total_allowed - IFNULL(SUM(la.no_of_days), 0)) AS avilable
      FROM leaves_type lt
      LEFT JOIN leave_application la
        ON la.leave_type_id = lt.id
        AND la.student_rollnum = ?
        AND la.status = "1"
      GROUP BY lt.id
      ORDER BY lt.id ASC
    `;

    const [leave_inform] = await db.query(sql, rollnum);


    const sql2 = `
  SELECT 
    la.id,
    la.no_of_days,
    la.from_date,
    la.to_date,
    la.applied_on,
    la.status,
    lt.name AS leave_type
  FROM leave_application la 
  LEFT JOIN leaves_type lt
    ON la.leave_type_id = lt.id
  WHERE la.student_rollnum = ?
  ORDER BY la.applied_on DESC
`;

    const [stuAllLeave] = await db.query(sql2, rollnum)

    return res.status(200).json({
      message: 'Leave information fetched successFully!',
      success: true,
      leave_inform,
      stuAllLeave
    });

  } catch (error) {

    console.error(error);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
      error: error.message
    });
  }
}
















