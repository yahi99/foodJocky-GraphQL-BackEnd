const User = require('../../models/user.model')
const Restaurant = require('../../models/restaurant.model')
const Order = require('../../models/order.model')
const mongoose = require('mongoose')

exports.addOrder = async(root, args, context) => {
   
    if(context.user.type !== 'customer'){

        let returnData = {
            error: true,
            msg: "Customer Login Required",
            data: {}
        }
        return returnData

    }

    try{

        let restaurant = await Restaurant.findById(args.orderInput.restaurant)
        let pin = restaurant.user.substring(0,3) + Math.floor(1000 + Math.random() * 9000)
        let order = {
            items: args.orderInput.items,
            total: args.orderInput.total,
            sub_total: args.orderInput.sub_total,
            delivery_charge: args.orderInput.delivery_charge,
            restaurant: args.orderInput.restaurant,
            customer: context.user.user_id,
            agent: restaurant.agent,
            status: 'pending',
            delivery_info: args.orderInput.delivery_info,
            pin: pin
        }

        if(restaurant.residential_or_municipal === 'residential'){
            order = {
                ...order,
                division: restaurant.division,
                district: restaurant.district,
                upazila: restaurant.upazila,
                union: restaurant.union,
                village: restaurant.village
            }
        }else{
            order = {
                ...order,
                division: restaurant.division,
                district: restaurant.district,
                municipal: restaurant.municipal,
                ward: restaurant.ward
            }
        }

        let newOrder = new Order(order)

        let nOrder = await newOrder.save()

        let updateCustomerLocationStatus = await User.updateOne(
            {
                _id: context.user.user_id
            },
            {
                $set: {
                    'customer_addresses.$[address].status': 1,
                    last_order: nOrder._id
                }
            },
            {
                arrayFilters: [
                    {
                        'address._id': args.orderInput.delivery_info._id
                    }
                ]
            })

        let newOrderData = await Order.findById(nOrder._id).populate('restaurant').populate('customer').populate('agent')

        let returnData = {
            error: false,
            msg: "Order Placed Successfully",
            data: newOrderData
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Order Place Failed",
            data: {}
        }
        return returnData

    }
    

}

exports.getAllOrdersByRestaurant = async(root, args, context) => {

    if(context.user.type !== 'restaurant'){

        let returnData = {
            error: true,
            msg: "Restaurant Login Required",
            data: {}
        }
        return returnData

    }

    try{
        let query = {
            restaurant: context.user.user_id
        }

        if(args.status !== ""){
            query.status = args.status
        }

        let orders = await Order.find(query).populate('restaurant').populate('customer').populate('agent')

        let returnData = {
            error: false,
            msg: "Orders Get Successfully",
            data: orders
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Orders Get UnSuccessful",
            data: []
        }
        return returnData

    }

}

exports.getAllOrdersByAgent = async(root, args, context) => {

    if(context.user.type !== 'agent'){

        let returnData = {
            error: true,
            msg: "Agent Login Required",
            data: {}
        }
        return returnData

    }

    try{
        let query = {
            agent: context.user.user_id
        }

        if(args.status !== ""){
            query.status = args.status
        }

        let orders = await Order.find(query).populate('restaurant').populate('customer').populate('agent')

        let returnData = {
            error: false,
            msg: "Orders Get Successfully",
            data: orders
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Orders Get UnSuccessful",
            data: []
        }
        return returnData

    }

}

exports.getAllOrdersByAdmin = async(root, args, context) => {

    if(context.user.type !== 'admin'){

        let returnData = {
            error: true,
            msg: "Admin Login Required",
            data: {}
        }
        return returnData

    }

    try{
        let query = {
        }

        if(args.status !== ""){
            query.status = args.status
        }

        let orders = await Order.find(query).populate('restaurant').populate('customer').populate('agent')

        let returnData = {
            error: false,
            msg: "Orders Get Successfully",
            data: orders
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Orders Get UnSuccessful",
            data: []
        }
        return returnData

    }

}

exports.getAllOrdersByCustomer = async(root, args, context) => {

    if(context.user.type !== 'customer'){

        let returnData = {
            error: true,
            msg: "Customer Login Required",
            data: {}
        }
        return returnData

    }

    try{
        let query = {
            customer: context.user.user_id
        }

        if(args.status !== ""){
            query.status = args.status
        }

        let orders = await Order.find(query).populate('restaurant').populate('customer').populate('agent')

        let returnData = {
            error: false,
            msg: "Orders Get Successfully",
            data: orders
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Orders Get UnSuccessful",
            data: []
        }
        return returnData

    }

}

exports.getOneOrder = async(root, args, context) => {

    try{
        let order = await Order.findById(args._id).populate('restaurant').populate('customer').populate('agent')
        if(!order){
            let returnData = {
                error: true,
                msg: "Order Get UnSuccessful",
                data: {}
            }
            return returnData
        }
        let returnData = {
            error: false,
            msg: "Order Get Successfully",
            data: order
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Order Get UnSuccessful",
            data: {}
        }
        return returnData

    }

}

exports.updateOrderStatus = async(root, args, context) => {

    try{
        let udata = {
            status: args.status 
        }
        if(args.delivery_time !== ''){
            udata = {
                ...udata,
                delivery_time: args.delivery_time
            }
        }
        let uOrder, order
        if(args._id !== ''){
            uOrder = await Order.updateOne({_id: args._id}, udata)
            order = await Order.findById(args._id).populate('restaurant').populate('customer').populate('agent')
        }else{
            uOrder = await Order.updateOne({pin: args.pin}, udata)
            order = await Order.findOne({pin: args.pin}).populate('restaurant').populate('customer').populate('agent')
        }
        
        if(uOrder.n > 0){
            
            let returnData = {
                error: false,
                msg: "Order Status Updated Successfully",
                data: order
            }
            return returnData
        }else{
            let returnData = {
                error: true,
                msg: "Order Status Update UnSuccessful",
                data: {}
            }
            return returnData
        }
        

    }catch(error){

        let returnData = {
            error: true,
            msg: "Order Status Update UnSuccessful",
            data: {}
        }
        return returnData

    }

}

exports.getReportByAdmin = async(root, args, context) => {

    if(context.user.type !== 'admin'){

        let returnData = {
            error: true,
            msg: "Admin Login Required",
            data: {}
        }
        return returnData

    }

    try{

        let startDate = new Date()
        startDate.setHours(0,0,0,0)
        

        let endDate = new Date()
        endDate.setHours(23,59,59,999)

        if(args.end_date !== ''){
            startDate = new Date(args.start_date)
            startDate.setHours(0,0,0,0)
        }

        if(args.end_date !== ''){
            endDate = new Date(args.end_date)
            endDate.setHours(23,59,59,999)
        }

        let restaurantId = mongoose.Types.ObjectId(args.restaurat_id)

        let nData = await Order.aggregate([
            {
                $match: {
                    status: 'paid',
                    restaurant: restaurantId,
                    createdAt: {
                        $gte:startDate,
                        $lte:endDate
                    }
                }
            }
        ])
        let total = await Order.aggregate([
            {
                $match: {
                    status: 'paid',
                    restaurant: restaurantId,
                    createdAt: {
                        $gte:startDate,
                        $lte:endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSum: {
                        $sum: '$total'
                    }
                }
            }
        ])

        let returnData = {
            error: false,
            msg: "Report Get Successfully",
            data: {
                orders: nData,
                total: total[0].totalSum
            }
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Report Get UnSuccessful",
            data: {}
        }
        return returnData

    }

}