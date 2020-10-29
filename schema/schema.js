const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLNonNull,
} = require('graphql');

const Todo = require('../models/Todo');
const User = require('../models/User');

// Type Definition
const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: { type: GraphQLID },
    text: { type: GraphQLString },
    done: { type: GraphQLBoolean },
    deleted: { type: GraphQLBoolean },
    user: {
      type: UserType,
      resolve: (parent) => {
        return User.findById(parent.userId);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    displayName: { type: GraphQLString },
    todos: {
      type: new GraphQLList(TodoType),
      resolve: (parent) => {
        return Todo.find({ userId: parent.id });
      },
    },
  }),
});

// Schema : Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    myTodos: {
      type: new GraphQLList(TodoType),
      resolve: (_, __, { user }) => {
        return Todo.findByUserId(user._id);
      },
    },
    allUsers: {
      type: new GraphQLList(UserType),
      resolve: () => {
        return User.find({});
      },
    },
    todos: {
      type: new GraphQLList(TodoType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { id }) => {
        console.log('hello?');
        return Todo.findByUserId(id);
      },
    },
  },
});

// Schema : Mutation
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addTodo: {
      type: TodoType,
      args: {
        text: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { text }, { user }) => {
        return Todo.createTodo(text, user);
      },
    },
    toggleTodo: {
      type: TodoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { id }, { user }) => {
        return Todo.toggleTodo(id, user);
      },
    },
    deleteTodo: {
      type: TodoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { id }, { user }) => {
        return Todo.deleteTodo(id, user);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
