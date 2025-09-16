const router = require('express').Router()
const authController = require('../../Controller/Auth/authController')


router.post('/login' , authController.login)
router.post('/forgot-password' , authController.forgotPassword)
router.post('/reset-password' , authController.verifyOtpAndUpdatePassword)


// only for trial
router.post("/send-otp-mobile", authController.sendOtpMobile);

module.exports = router;