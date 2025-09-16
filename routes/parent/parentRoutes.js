const express = require('express')
const parentController = require('../../Controller/parentController')

const router = express.Router()

router.get('/allparents' ,parentController.allParents )
router.get('/speparent/:parentId' , parentController.speParentData)


// guardian riutes
router.get('/allguardians' , parentController.allGuardian)
router.get('/speguardian/:guaId' , parentController.speGuardianData)

module.exports = router