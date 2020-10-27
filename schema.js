
const { mergeTypeDefs } = require('graphql-tools-merge-typedefs')
const { mergeResolvers } = require('@graphql-tools/merge')
const { makeExecutableSchema } = require('apollo-server-express')

const categorySchema = require('./schemas/admin/category.schema')
const planSchema = require('./schemas/admin/plan.schema')
const ownerSchema = require('./schemas/owner/owner.schema')

const categoryResolver = require('./resolvers/admin/category.resolver')
const planResolver = require('./resolvers/admin/plan.resolver')
const ownerResolver = require('./resolvers/owner/owner.resolver')

const types = [
	categorySchema,
	ownerSchema,
	planSchema,
]

const typeDefs = mergeTypeDefs(types)

const resolvers = [
	categoryResolver,
	planResolver,
	ownerResolver,
  ]

const graphQlResolvers = mergeResolvers(resolvers)

module.exports = makeExecutableSchema({
	typeDefs: typeDefs,
	resolvers: graphQlResolvers
})