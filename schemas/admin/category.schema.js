const { gql } = require('apollo-server-express');
const typeDefs = gql`
  type Query {
    getAllCategories: CategoriesOutPut
  }

  type Mutation {
    addCategory(name: String): AddOutPut
    deleteCategory(_id: ID): DeleteOutPut
  }

  type AddOutPut {
      error: Boolean
      msg: String
      data: CategoryData
  }

  type DeleteOutPut {
    error: Boolean
    msg: String
}

type CategoriesOutPut {
    error: Boolean
    msg: String
    data: [CategoryData]
}

  type CategoryData {
    _id: ID
    name: String
  }
`
module.exports = typeDefs