const express = require('express')
const timeTableController = require('../../Controller/timeTableController')

const router = express.Router()

router.post('/addtimetable' , timeTableController.addTimeTable)
router.get('/gettimetable' , timeTableController.getTimeTable)

module.exports = router;