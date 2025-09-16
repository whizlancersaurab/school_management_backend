const express = require('express')
const sectionController = require('../../Controller/sectionController')


const router = express.Router()


router.get('/' , sectionController.allSection)
router.post('/addclasssection' , sectionController.addSection)
router.delete('/deleteclasssection/:id' , sectionController.deleteSection)


module.exports = router