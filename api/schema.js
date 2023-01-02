const defType = `
type Query {
  itemAll: [Item]
}

type Mutation {
  itemMod(id: Int, title: String): Item
}

type Item {
  id: Int
  title: String
}
`

const items = [
  { id: 1, title: 'item 1' },
  { id: 2, title: 'item 2' },
  { id: 3, title: 'item 3' },
  { id: 4, title: 'item 4' },
  { id: 5, title: 'item 5' }
]

const defResolver = {
  Query: {
    itemAll: async (root, args, ctx) => {
      console.log('- itemAll')
      return items
    }
  },
  Mutation: {
    itemMod: async (root, args, ctx) => {
      console.log('- itemMod', args)
      const item = items.find(i => i?.id === +args.id)
      item.title = args.title
      return item
    }
  }
}

module.exports = {
  resolvers: defResolver,
  schema: [defType]
}
