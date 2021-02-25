const OTP = require('../../models/otp.model')

exports.sendOtp = async(root, args, context) => {

    try{
        let otpdata = {
            mobile: args.mobile,
            otp: Math.floor(1000 + Math.random() * 9000),
            count: 0
        }

        let newOtp = new OTP(otpdata)

        let nOtp = await newOtp.save()

        // Will Implement sms api here-----------------------

        let returnData = {
            error: false,
            msg: "OTP Send Successfully"
        }
        return returnData

    }catch(error){

        if (error.code === 11000 && error.keyPattern.mobile) {
            let returnData = {
                error: true,
                msg: 'Mobile Number Already Available in OTP Verification Mode Please Wait...'
            }
            return returnData
        }

        let returnData = {
            error: true,
            msg: "Server Failure"
        }
        return returnData

    }
}

exports.verifyOtp = async(root, args, context) => {

    try{
        let otpdata = {
            mobile: args.mobile
        }

        let checkOTP = await OTP.findOne(otpdata)

        if(!checkOTP){
            let returnData = {
                error: true,
                msg: "OTP Does not Match Please Send OTP Again"
            }
            return returnData
        }

        
        if(checkOTP.otp === args.otp){

            await OTP.deleteOne({mobile: args.mobile})
            let returnData = {
                error: false,
                msg: "OTP Verification Successful"
            }
            return returnData
        }

        if(checkOTP.count >= 3){
            await OTP.deleteOne({mobile: args.mobile})
            let returnData = {
                error: false,
                msg: "You Have Putted Wrong OTP Many Times Please Send OTP Again"
            }
            return returnData
        }

        let otpCount = checkOTP.count + 1

        checkOTP.count = otpCount
        await checkOTP.save()

        let returnData = {
            error: true,
            msg: "OTP Does not Match"
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Server Failure"
        }
        return returnData

    }
}