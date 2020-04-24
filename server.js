const express = require('express');
const dotenv = require('dotenv');
const expressGraphQL = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');

dotenv.config();
const app = express();

const pictures = [
    { id: "710012064", imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "None But the Brave", authorId: '875228391' },
    { id: "421074021", imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Radioactive Dreams", authorId: '40243259' },
    { id: "837131963", imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Baron Blood (Orrori del castello di Norimberga, Gli)", authorId: '326408350' },
    { id: "551808815", imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Saving Silverman (Evil Woman)", authorId: '348582348' },
    { id: "204821721", imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Meet the Fockers", authorId: '476706009' },
    { id: '321648013', imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Eternal Sunshine of the Spotless Mind", authorId: '875228391' },
    { id: '119191529', imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Frida", authorId: '326408350' },
    { id: '303142492', imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "4th Man, The (Fourth Man, The) (Vierde man, De)", authorId: '476706009' },
    { id: '512479429', imageUrl: "https://images.pexels.com/photos/3075988/pexels-photo-3075988.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260", genre: "nature", title: "Private Function, A", authorId: '476706009' }];

let authors = [
    { id: '875228391', name: "Alex", lastName: "Malo" },
    { id: '40243259', name: "Oscar", lastName: "Malo" },
    { id: '326408350', name: "Luis", lastName: "Malo" },
    { id: '348582348', name: "Herzen", lastName: "Malo" },
    { id: '476706009', name: "Juanmi", lastName: "Malo" }];

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        pictures: {
            type: GraphQLList(PictureType),
            resolve: (author) => {
                return pictures.filter(picture => author.id === picture.authorId);
            }
        }
    })
});

const PictureType = new GraphQLObjectType({
    name: 'Picture',
    description: 'This represent a picture take by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        imageUrl: { type: GraphQLNonNull(GraphQLString) },
        genre: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLString) },
        autor: {
            type: AuthorType,
            resolve: (picture) => {
                return authors.find(author => author.id === picture.authorId);
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        // Roots
        picture: {
            type: PictureType,
            description: 'One Picture',
            args: { id: { type: GraphQLString } },
            resolve: (parent, args) => pictures.find(picture => picture.id === args.id)
        },
        pictures: {
            type: GraphQLList(PictureType),
            description: 'List of Pictures',
            resolve: () => pictures
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'List of Authors',
            resolve: () => authors
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addPicture: {
            type: PictureType,
            description: 'Add a Picture',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                imageUrl: { type: GraphQLNonNull(GraphQLString) },
                genre: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const picture = { id: (Math.random() * 10000).toString(), title: args.title, imageUrl: args.imageUrl, genre: args.genre, authorId: args.authorId };
                pictures.push(picture);
                return picture;
            }
        }
    })
})
// Sample of Creating new Picture
// mutation { addPicture(title: "tutut", imageUrl: "tutu", genre: "Video", authorId: "234234234"){ title } }

graphqlSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/', expressGraphQL({
    schema: graphqlSchema,
    graphiql: true
}))

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);