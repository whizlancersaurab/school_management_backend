const express = require('express')
const studentController = require('../../Controller/studentController')
const fileController = require('../../Controller/fileController')
const upload = require('../../multer/multer')


const router = express.Router()

router.post('/add', studentController.addStudent);
router.get('/', studentController.allStudents)
router.get('/:id' , studentController.specificDetailsStu)

// timetable
router.get('/timetable/:id' , studentController.getTimeTable)

// leave
router.post('/addleave' , studentController.addStudentLeave)
router.get('/leavedata/:rollnum' , studentController.getStuLeaveData)



// file upload and delete
router.post('/upload', upload.single('stufile'), fileController.uploadFile);
router.delete('/deletefile/:id' , fileController.deleteFile)

module.exports = router