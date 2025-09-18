// server.js
const express = require("express");
const cors = require("cors");
require('dotenv').config()
const path = require('path')

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin: "https://school-management-krsj.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// for image
app.use('/api/stu/uploads/image', express.static(path.join(__dirname, 'uploads/image')))

// for document
app.use('/api/stu/uploads/document', express.static(path.join(__dirname, 'uploads/document')))



app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});



app.use("/api/stu", require('./routes/student/studentRoutes'));
app.use('/api/table', require('./routes/timeTable/timetableRoutes'))
app.use('/api/section', require('./routes/classSection/sectionRoutes'))
app.use('/api/subject', require('./routes/classSubject/subjectRoutes'))
app.use('/api/library', require('./routes/Library/libraryRoutes'))
app.use('/api/attendance', require('./routes/attendance/attendanceRoutes'))
app.use('/api/fees', require('./routes/StudentFees/feesRoutes'))
app.use('/api/exam', require('./routes/exam/examRoutes'))
app.use('/api/reason', require('./routes/academicReason/reasonRoutes'))
app.use('/api/class' , require('./routes/classes/classRoutes'))

// leave
app.use('/api/leave', require('./routes/leave/leaveRoutes'))
// parent
app.use('/api/parent', require('./routes/parent/parentRoutes'))

// teacher routes
app.use("/api/teacher", require('./routes/teacher/teacherRoutes'))
// homework
app.use('/api/homework', require('./routes/homework/homeworkRoutes'))

// auth
app.use("/api/auth", require('./routes/Auth/authRoutes'))




app.listen(port, () => console.log(`✅ Server is running on port ${port}`));
