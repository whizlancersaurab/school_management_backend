const router = require('express').Router()
const homeworkController = require('../../Controller/homework/homeworkController')

router.post('/addhomework' , homeworkController.addHomeWork)
router.get('/allhomework' , homeworkController.allHomewrok)

module.exports = router