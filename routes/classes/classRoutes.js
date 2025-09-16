const router = require('express').Router()
const classController= require('../../Controller/Classes/classController')



router.post('/addclass' ,classController.addClass)
router.get('/allclass' , classController.getClasses)

module.exports = router