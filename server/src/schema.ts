import {gql} from 'graphql-tag';

export const resolvers = {
  Query: {
    test: () => {
      return "hello";
    }
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