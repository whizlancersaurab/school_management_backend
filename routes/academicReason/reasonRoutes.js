const router = require('express').Router()
const acedmicReasonController = require('../../Controller/academicReasonController')


router.post('/addreason' , acedmicReasonController.addReason)
router.get('/allreason' , acedmicReasonController.allReason)
router.delete('/deletereason/:id' , acedmicReasonController.deleteReason)


module.exports = router