import {gql} from 'graphql-tag';

export const resolvers = {
  Query: {
    test: () => {
      return "hello";
    }
  }
}

export const typeDefs = gql`
  Query {
    test: String
  }
`