const User = require('../../models/user.model')
const Restaurant = require('../../models/restaurant.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.addRestaurant = async(root, args, context) => {
   
    if(context.user.type !== 'owner'){

        let returnData = {
            error: true,
            msg: "Owner Login Required",
            data: {}
        }
        return returnData

    }

    try{
        const hash = bcrypt.hashSync(args.restaurantInput.password, 8);
        let newRestaurant = new Restaurant({
            user: args.restaurantInput.user,
            password: hash,
            name: args.restaurantInput.name,
            restaurant_or_homemade: args.restaurantInput.restaurant_or_homemade,
            owner: context.user.user_id,
            plan: args.restaurantInput.plan,
            tags: args.restaurantInput.tags,
            description: args.restaurantInput.description,
            cover_img: args.restaurantInput.cover_img,
            thumb_img: args.restaurantInput.thumb_img,
            address: args.restaurantInput.address,
            food_categories: args.restaurantInput.food_categories,
            price_type: args.restaurantInput.price_type,
            status: "pending"
        })

        let nRestaurant = await newRestaurant.save();

        let returnData = {
            error: false,
            msg: "Restaurant Created Successfully",
            data: nRestaurant
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Mobile Number Already Taken",
            data: {}
        }
        return returnData

    }
    

}

exports.restaurantLogin = async(root, args, context) => {
    
    try{

        let restaurant = await Restaurant.findOne({
            user: args.user
        })

        if(!restaurant){
            let returnData = {
                token: '',
                error: true,
                msg: "Restaurant Not Found",
                data: {}
            }
            return returnData
        }

        if(restaurant.status !== 'approved'){
            let returnData = {
                token: '',
                error: true,
                msg: "Restaurant Not Approved",
                data: {}
            }
            return returnData
        }

        let passMatch = await bcrypt.compare(args.password, restaurant.password)

        if(!passMatch){
            let returnData = {
                token: '',
                error: true,
                msg: "Password Not Matched",
                data: {}
            }
            return returnData
        }

        const token = jwt.sign(
            {
                _id: restaurant._id
            }
            , process.env.SECRET, 
            {
            expiresIn: "8h"
        })

        let returnData = {
            token: token,
            error: false,
            msg: "Restaurant Login Successful",
            data: restaurant
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Restaurant Login UnSuccessful",
            data: {}
        }
        return returnData

    }
    

}

// By Owner
exports.updateRestaurant = async(root, args, context) => {

    if(context.user.type !== 'owner'){

        let returnData = {
            error: true,
            msg: "Owner Login Required",
            data: {}
        }
        return returnData

    }
    
    try{

        let updateArgs = {
            _id: args.restaurantInput._id
        }

        let upRestaurant = {
            user: args.restaurantInput.user,
            name: args.restaurantInput.name,
            restaurant_or_homemade: args.restaurantInput.restaurant_or_homemade,
            plan: args.restaurantInput.plan,
            tags: args.restaurantInput.tags,
            description: args.restaurantInput.description,
            cover_img: args.restaurantInput.cover_img,
            thumb_img: args.restaurantInput.thumb_img,
            address: args.restaurantInput.address,
            food_categories: args.restaurantInput.food_categories,
            price_type: args.restaurantInput.price_type,
        }

        if(args.restaurantInput.password !== ''){
            const hash = bcrypt.hashSync(args.restaurantInput.password, 8);
            upRestaurant.password = hash
        }

        let uRestaurant = await Restaurant.updateOne(updateArgs,upRestaurant)

        if(uRestaurant.n > 0){

            let returnData = {
                error: false,
                msg: "Restaurant Updated Successfully"
            }
            return returnData

        }else{
            let returnData = {
                error: true,
                msg: "Restaurant Update Failed!!!"
            }
            return returnData
        }
        

    }catch(error){

        let returnData = {
            error: true,
            msg: "Restaurant Update Unsuccessful"
        }
        return returnData

    }
    

}

exports.deleteRestaurant = async(root, args, context) => {

    try{
        let deleteArgs = {
            _id: args._id
        }
        let RestaurantDelete = await User.deleteOne(deleteArgs)
        if(RestaurantDelete.n > 0){

            let returnData = {
                error: false,
                msg: "Restaurant Deletion Successful"
            }
            return returnData

        }else{

            let returnData = {
                error: true,
                msg: "Restaurant Deletion UnSuccessful"
            }
            return returnData

        }

    }catch(error){

        let returnData = {
            error: true,
            msg: "Restaurant Deletion UnSuccessful"
        }
        return returnData

    }

}

exports.getAllRestaurantsByAdmin = async(root, args, context) => {

  // todo
  if(context.user.type !== 'admin'){

    let returnData = {
        error: true,
        msg: "Admin Login Required",
        data: {}
    }
    return returnData

}

  try{

    let query = {}

    if(args.owner_id !== ""){
        query.owner = args.owner_id
    }

    if(args.status !== ""){
        query.status = args.status
    }

    let result = await Restaurant.find(query)

    let returnData = {
        error: false,
        msg: "Restaurant Get Successfully",
        data: result
    }
    return returnData

  }catch(error){

    let returnData = {
        error: true,
        msg: "Restaurant Get Unsuccessful"
    }
    return returnData

  }
}

exports.getAllRestaurantsByOwner = async(root, args, context) => {
  // todo

  if(context.user.type !== 'owner'){

    let returnData = {
        error: true,
        msg: "Owner Login Required",
        data: {}
    }
    return returnData

}

  try{

    let query = {
        owner: context.user.user_id
    }

    if(args.status !== ""){
        query.status = args.status
    }

    let result = await Restaurant.find(query)

    let returnData = {
        error: false,
        msg: "Restaurant Get Successfully",
        data: result
    }
    return returnData

  }catch(error){

    let returnData = {
        error: true,
        msg: "Restaurant Get Unsuccessful"
    }
    return returnData

  }
    




}

exports.getOneRestaurant = async(root, args, context) => {

    // todo

    try{

        let result = await Restaurant.findById(args._id)

        let returnData = {
            error: false,
            msg: "Restaurant Get Successfully",
            data: result
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Restaurant Get Unsuccessful"
        }
        return returnData

    }

}


exports.updateRestaurantStatus = async(root, args, context) => {

    if(context.user.type !== 'admin'){

        let returnData = {
            error: true,
            msg: "Admin Login Required",
            data: {}
        }
        return returnData

    }
    
    try{

        let updateArgs = {
            _id: args.restaurantInput._id
        }

        let upRestaurant = {
            user: args.restaurantInput.user,
            name: args.restaurantInput.name,
            restaurant_or_homemade: args.restaurantInput.restaurant_or_homemade,
            plan: args.restaurantInput.plan,
            tags: args.restaurantInput.tags,
            description: args.restaurantInput.description,
            cover_img: args.restaurantInput.cover_img,
            thumb_img: args.restaurantInput.thumb_img,
            address: args.restaurantInput.address,
            food_categories: args.restaurantInput.food_categories,
            price_type: args.restaurantInput.price_type,
            status: args.restaurantInput.status
        }

        if(args.restaurantInput.password !== ''){
            const hash = bcrypt.hashSync(args.restaurantInput.password, 8);
            upRestaurant.password = hash
        }

        let uRestaurant = await Restaurant.updateOne(updateArgs,upRestaurant)

        if(uRestaurant.n > 0){

            let returnData = {
                error: false,
                msg: "Restaurant Updated Successfully"
            }
            return returnData

        }else{
            let returnData = {
                error: true,
                msg: "Restaurant Update Failed!!!"
            }
            return returnData
        }
        

    }catch(error){

        let returnData = {
            error: true,
            msg: "Restaurant Update Unsuccessful"
        }
        return returnData

    }
    

}