const User = require('../../models/user.model')
const Settings = require('../../models/settings.model')
const Transaction = require('../../models/transaction.model')
const axios = require('axios')
const FormData = require('form-data')
const mongoose = require('mongoose')

exports.addBalance = async (root, args, context) => {

    if(context.user.type !== 'customer'){

        let returnData = {
            error: true,
            msg: "Customer Login Required",
            data: {}
        }
        return returnData

    }

    try {
        let customer = await User.findById(context.user.user_id)
        let setting = await Settings.findOne({})
        
        let address = ""
        let current_balance,previous_balance
        //let cashbackPercentange = setting.customer_cashback_percentange
        if(customer.customer_addresses.length > 0){
            address = customer.customer_addresses[0].address.address
        }
        //let cashback = (args.amount * cashbackPercentange)/100
        let amount = args.amount
        //let totalAmount = cashback + amount
        
        
        if(customer.balance !== undefined){
            previous_balance = customer.balance
            current_balance = customer.balance + amount
        }else{
            previous_balance = 0
            current_balance = amount
        }
        
        let transaction = new Transaction({
            current_balance: current_balance,
            previous_balance: previous_balance,
            amount: amount,
            cashback: 0,
            cashback_percentange: 0,
            debit_or_credit: 'debit',
            reason: 'Add Balance to Wallet',
            status: 'pending',
            user: context.user.user_id
        })
        
        let nTransaction = await transaction.save()

        const formData = new FormData()
        formData.append('store_id', setting.ssl_commerez_store_id)
        formData.append('store_passwd', setting.ssl_commerez_store_password)
        formData.append('total_amount', args.amount)
        formData.append('currency', setting.ssl_commerez_currency)
        formData.append('tran_id', nTransaction._id.toString())
        formData.append('success_url', args.url)
        formData.append('fail_url', args.url)
        formData.append('cancel_url', args.url)
        formData.append('cus_name', customer.first_name + customer.last_name)
        formData.append('cus_email', customer.email !== ""? customer.email: "notgiven@gmail.com" )
        formData.append('cus_add1', address === ""? "Khulna" : address)
        formData.append('cus_city', setting.ssl_commerez_cus_city)
        formData.append('cus_country', setting.ssl_commerez_cus_country)
        formData.append('cus_phone', customer.mobile)
        formData.append('shipping_method', 'NO')
        formData.append('product_name', 'Food')
        formData.append('product_category', 'food')
        formData.append('product_profile', 'general')

        let sslData = await axios.post('https://securepay.sslcommerz.com/gwprocess/v4/api.php', formData, {headers: formData.getHeaders()})
        let rData = {
            transaction_id: nTransaction._id,
            GatewayPageURL: sslData.data.GatewayPageURL
        }

        let returnData = {
            error: false,
            msg: 'Successfully Added Balance',
            data: rData
        }
        return returnData

    } catch (error) {
        
        let returnData = {
            error: true,
            msg: 'Problem in adding Balance',
            data: {}
        }
        return returnData
    }
}

exports.trackTransaction = async (root, args, context) => {

    try {

        let setting = await Settings.findOne({})
        let store_id = setting.ssl_commerez_store_id
        let store_passwd = setting.ssl_commerez_store_password
        let tran_id =  args._id.toString()
        let returnData

        let sslData = await axios.get(`https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`)

        if(sslData.data.APIConnect === 'DONE'){

            if(sslData.data.element[0].status === 'VALID' ||  sslData.data.element[0].status === 'VALIDATED'){
                let transaction = await Transaction.findByIdAndUpdate({_id: args._id}, {status: 'success', validate_response: sslData.data})
                let user = await User.updateOne({_id: transaction.user}, {balance: transaction.current_balance, cashback: transaction.cashback})
                if(user.n > 0 && transaction){
                    returnData = {
                        error: false,
                        msg: 'Successfully Validated',
                        data: {
                            status: sslData.data.element[0].status
                        }
                    }
                    
                }else {
                    returnData = {
                        error: true,
                        msg: 'Problem in Updating Data',
                        data: {
                            status: sslData.data.element[0].status
                        }
                    }
                    
                }
        
            }else{
                returnData = {
                    error: true,
                    msg: 'Not Validated',
                    data: {
                        status: sslData.data.element[0].status
                    }
                }
                
            }
        }else{
            returnData = {
                error: true,
                msg: 'SSL Api Not Connected',
                data: {}
            }
            
        }
        
        return returnData
        
    } catch (error) {
        
        let returnData = {
            error: true,
            msg: 'Problem in Updating'
        }
        return returnData
    }
}

exports.getWalletPageData = async (root, args, context) => {

    if(context.user.type !== 'customer'){

        let returnData = {
            error: true,
            msg: "Customer Login Required",
            data: {}
        }
        return returnData

    }

    try {
        let customer = await User.findById(context.user.user_id)
        let total = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    user: mongoose.Types.ObjectId(context.user.user_id),
                }
            },
            {
                $group: {
                    _id: '$debit_or_credit',
                    totalSum: {
                        $sum: '$amount'
                    }
                }
            }
        ])
        let transactions = await Transaction.find({user: context.user.user_id}).sort({createdAt: -1})
        let totalDebit = 0, totalCredit = 0
        for(let i=0; i<total.length; i++){
            if(total[i]._id === 'debit'){
                totalDebit = total[i].totalSum
            }
            if(total[i]._id === 'credit'){
                totalCredit = total[i].totalSum
            }
        }
        let returnData = {
            error: false,
            msg: 'Wallet Page data Get Successfully',
            data: {
                balance: customer.balance === undefined ? 0: customer.balance,
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                transactions: transactions
            }
        }

        return returnData
        
    } catch (error) {
        
        let returnData = {
            error: true,
            msg: 'Problem in Getting Data'
        }
        return returnData
    }
}