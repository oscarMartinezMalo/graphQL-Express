const express = require('express');
var cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const expressGraphQL = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');
const Picture = require('./graphql/models/picture.model');
const Author = require('./graphql/models/author.model');

dotenv.config();
const app = express();
app.use(cors());
mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent a book written by an author',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        facePictureUrl: { type: GraphQLNonNull(GraphQLString) },
        pictures: {
            type: GraphQLList(PictureType),
            resolve: async (author) => {
                return await Picture.find({ authorId: author._id }).exec();
            }
        }
    })
});

const PictureType = new GraphQLObjectType({
    name: 'Picture',
    description: 'This represent a picture take by an author',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        imageUrl: { type: GraphQLNonNull(GraphQLString) },
        genre: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLString) },
        author: {
            type: AuthorType,
            resolve: async (picture) => {
                return await Author.findOne({ _id: picture.authorId }).exec();
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
            resolve: async (parent, args) => {
                try {
                    const pic = await Picture.findOne({ _id: args.id }).exec();
                    if (!pic) return null;
                    return pic;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        },
        pictures: {
            type: GraphQLList(PictureType),
            description: 'List of Pictures',
            resolve: async () => {
                const picts = await Picture.find().sort({ title: 1 }).exec();
                const result = picts.map((pic) => ({
                    _id: pic._id,
                    title: pic.title,
                    imageUrl: pic.imageUrl,
                    genre: pic.genre,
                    authorId: pic.authorId,
                }));
                return result;
            }
        },
        picturesOffSet: {
            type: GraphQLList(PictureType),
            description: 'List of Pictures',
            args: { offSet: { type: GraphQLInt } },
            resolve: async (parent, args) => {
                const picts = await Picture.find().sort({ title: 1 }).skip(args.offSet).limit(9).exec();
                const result = picts.map((pic) => ({
                    _id: pic._id,
                    title: pic.title,
                    imageUrl: pic.imageUrl,
                    genre: pic.genre,
                    authorId: pic.authorId,
                }));

                console.log(result);
                return result;
            }
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'List of Authors',
            resolve: async () => {
                const authors = await Author.find().sort({ name: 1 }).exec();
                const result = authors.map((author) => ({
                    _id: author._id,
                    name: author.name,
                    lastName: author.lastName,
                    facePictureUrl: author.facePictureUrl
                }));
                return result;
            }
        },
        picturesByAuthor: {
            type: AuthorType,
            description: 'List of Pictures by Author',
            args: { id: { type: GraphQLString } },
            resolve: async (parent, args) => {
                try {
                    const pics = await Author.findOne({ _id: args.id }).exec();
                    if (!pics) return null;
                    return pics;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        // CREATE AUTHOR
        addAuthor: {
            type: AuthorType,
            description: 'Add a Author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                lastName: { type: GraphQLNonNull(GraphQLString) },
                facePictureUrl: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args) => {
                const author = new Author({
                    // _id: new mongoose.Types.ObjectId(),
                    name: args.name,
                    lastName: args.lastName,
                    facePictureUrl: args.facePictureUrl
                });

                try {
                    return await author.save();
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        },
        // DELETE AUTHOR
        deleteAuthor: {
            type: AuthorType,
            description: 'Delete a Author',
            args: {
                id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                const deleted = await Author.deleteOne({ _id: args.id }).exec();

                if (deleted.n === 0) return null;
                return new Author({ _id: args.id });
            }
        },
        // UPDATE AUTHOR
        updateAuthor: {
            type: AuthorType,
            description: 'Update a Author',
            args: {
                id: { type: GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLString },
                lastName: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const updateAuthor = await Author.findOne({ _id: args.id }).exec();

                updateAuthor.name = args.name;
                updateAuthor.lastName = args.lastName;

                return await updateAuthor.save();
            }
        },
        // CREATE PICTURE
        addPicture: {
            type: PictureType,
            description: 'Add a Picture',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                imageUrl: { type: GraphQLNonNull(GraphQLString) },
                genre: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args) => {
                const pic = new Picture({
                    // _id: new mongoose.Types.ObjectId(),
                    title: args.title,
                    imageUrl: args.imageUrl,
                    genre: args.genre,
                    authorId: args.authorId
                });

                try {                    
                    let pictureSaved = await pic.save();                    
                    pictureSaved.author = await Author.findById(args.authorId).exec(); // Add the author to the response
                    return pictureSaved;
                    
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        },
        // DELETE PICTURE
        deletePicture: {
            type: PictureType,
            description: 'Delete a Picture',
            args: {
                id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                const deleted = await Picture.deleteOne({ _id: args.id }).exec();

                if (deleted.n === 0) return null;
                return new Picture({ _id: args.id });
            }
        },
        // UPDATE PICTURE
        updatePicture: {
            type: PictureType,
            description: 'Update a Picture',
            args: {
                id: { type: GraphQLNonNull(GraphQLString) },
                title: { type: GraphQLString },
                imageUrl: { type: GraphQLString },
                genre: { type: GraphQLString },
                authorId: { type: GraphQLString },
            },
            resolve: async (parent, args) => {
                console.log('update');
                const updatePicture = await Picture.findOne({ _id: args.id }).exec();

                updatePicture.title = args.title;
                updatePicture.imageUrl = args.imageUrl;
                updatePicture.genre = args.genre;
                updatePicture.authorId = args.authorId;

                return await updatePicture.save();
            }
        },
    })
});
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
