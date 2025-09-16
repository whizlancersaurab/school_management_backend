const express = require('express')
const subjectController = require('../../Controller/subjectController')



const router = express.Router()
router.post('/addsubject' , subjectController.addSubject)

router.get('/' , subjectController.allSubject)



module.exports = router