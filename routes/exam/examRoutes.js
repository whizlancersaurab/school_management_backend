const router = require('express').Router()
const examController = require('../../Controller/examController')

router.post('/addexam' ,examController.addExamName )
router.get('/allexamdata' , examController.allExamData)
router.delete('/deleteexam/:id' , examController.deleteExam)

// exams hedule
router.post('/addexamschedule' , examController.addExamSchedule)
router.get('/allscheduledata' , examController.allScheduleData)

// exam grade
router.post('/addgrade' , examController.addExamGrade)
router.get('/allgrade' , examController.allGrades)


module.exports = router