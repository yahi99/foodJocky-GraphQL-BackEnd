const Category = require('../../models/category.model')

exports.addCategory = async(root, args, context) => {


    if(context.user.type !== 'admin'){

        let returnData = {
            error: true,
            msg: "Admin Login Required",
            data: {}
        }
        return returnData

    }
    
    try{

        let newCategoy = new Category({
            name: args.name
        })

        let nCategoy = await newCategoy.save()
        let returnData = {
            error: false,
            msg: "Category Created Successfully",
            data: nCategoy
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Category Creation UnSuccessful",
            data: {}
        }
        return returnData

    }
    

}

exports.deleteCategory = async(root, args, context) => {

    if(context.user.type !== 'admin'){

        let returnData = {
            error: true,
            msg: "Admin Login Required",
            data: {}
        }
        return returnData

    }

    try{
        let deleteArgs = {
            _id: args._id
        }
        let categoryDelete = await Category.deleteOne(deleteArgs)
        if((categoryDelete).n > 0){

            let returnData = {
                error: false,
                msg: "Category Deletion Successful"
            }
            return returnData

        }else{

            let returnData = {
                error: true,
                msg: "Category Deletion UnSuccessful"
            }
            return returnData

        }

    }catch(error){

        let returnData = {
            error: true,
            msg: "Category Deletion UnSuccessful"
        }
        return returnData

    }

}

exports.getAllCategories = async(root, args, context) => {

    try{
        const resPerPage = args.perPageValue || 10
        const page = args.page || 1
        const query = {
            name: {$regex: args.name, $options: 'i'}
        }
        let categoies = await Category.find(query).skip((resPerPage * page) - resPerPage).limit(resPerPage).sort({createdAt: -1})

        let returnData = {
            error: false,
            msg: "Category Get Successfully",
            data: categoies
        }
        return returnData

    }catch(error){

        let returnData = {
            error: true,
            msg: "Category Get UnSuccessful",
            data: []
        }
        return returnData

    }

}