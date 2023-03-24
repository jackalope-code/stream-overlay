import {gql} from 'graphql-tag';

export const resolvers = {
  Query: {
    test: () => {
      return "hello";
    }
  },
  Subscription: {
    hello: {
      // Example using an async generator
      componentUpdate: async function* () {
        for await (const word of ['Hello', 'Bonjour', 'Ciao']) {
          yield { hello: word };
        }
      },
    },
  }
}

export const typeDefs = gql`
  type ComponentData {
    id: ID!
    x: Int!
    y: Int!
    moving: Boolean!
    owner: String
  }
  type Query {
    test: String
  }
  type Subscription {
    componentUpdate: ComponentData
  }
`