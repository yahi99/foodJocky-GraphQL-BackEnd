const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

const OwnerController = require('../../controllers/owner/owner.controller')

const OWNER_ADDED = "OWNER_ADDED"

const resolvers = {
  Subscription: {
    ownerAdded: {
      subscribe: () => pubsub.asyncIterator(OWNER_ADDED),
    }
  },
  Query: {
    async getAllOwners(root, args, context) {
       let results = await OwnerController.getAllOwners(root, args, context)
       return results
    },

    async getOneOwner(root, args, context) {
      let result = await OwnerController.getOneOwner(root, args, context)
      return result
   },

   async ownerLogin(root, args, context) {
    let result = await OwnerController.ownerLogin(root, args, context)
    return result
  },

  async verifyOwnerToken(root, args, context) {
    let result = await OwnerController.verifyOwnerToken(root, args, context)
    return result
  }

  },
  Mutation: {
    async addOwner(root, args, context) {
      let result = await OwnerController.addOwner(root, args, context)
      pubsub.publish(OWNER_ADDED, { ownerAdded: result });
      return result
    },
    
    async updateOwner(root, args, context) {
      let result = await OwnerController.updateOwner(root, args, context)
      return result
    },

    async deleteOwner(root, args, context) {
        let result = await OwnerController.deleteOwner(root, args, context)
        return result
      },

      async updateOwnerWithStatus(root, args, context) {
        let result = await OwnerController.updateOwnerWithStatus(root, args, context)
        return result
      },
  },
};

module.exports = resolvers;