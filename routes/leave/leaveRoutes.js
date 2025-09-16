const router = require('express').Router()
const leaveControler = require('../../Controller/leave/leaveTypeController')

router.get('/allleavetype' ,leaveControler.getAllLeaveTypes)
router.post('/addleavetype' , leaveControler.addLeaveType)

module.exports = router