require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());


//firebase admin keys

const admin = require("firebase-admin");
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
// console.log(decoded);

const serviceAccount = JSON.parse(decoded)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


//Verify firebase token
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    console.log("Authorization Header:", req.headers.authorization);
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        console.log('Decoded token', decoded);
        req.decoded = decoded;
        next()
    }
    catch (error) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
}

const verifyTokenEmail = (req, res, next) => {
    const emailFromClient = req.query.email || req.params.email;
    if (emailFromClient !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
    }
    next();
};





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterofrazu.6jqzkwj.mongodb.net/?retryWrites=true&w=majority&appName=clusterOfRazu`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        //Client DB collections
        const queriesCollection = client.db('altPick').collection('queries');
        const recommendationsCollection = client.db('altPick').collection('recommendations');



        //Queries related APIs

        //get all queries with no query
        app.get('/queries', async (req, res) => {
            const result = await queriesCollection.find().toArray();
            res.send(result);
        })

        //get only 6 queries from all queries of queries collection
        app.get('/queries/latest', async (req, res) => {
            const result = await queriesCollection.find().sort({ timestamp: -1 }).limit(6).toArray();
            res.send(result);
        });

        // get specific id query from collection
        app.get('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await queriesCollection.findOne(query);
            res.send(result);
        })

        // get specific query by userEmail from collection
        app.get('/queries/userEmail/:email', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await queriesCollection.find(query).toArray();
            res.send(result);
        })



        //post query
        app.post('/queries', async (req, res) => {
            const newProductQuery = req.body;
            const result = await queriesCollection.insertOne(newProductQuery);
            res.send(result);
        });

        //put method for updating specific query
        app.put('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedQuery = req.body;
            const updatedDoc = {
                $set: updatedQuery
            }

            const result = await queriesCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })

        // recommendations count increment by patch
        app.patch('/queries/increment/:id', async (req, res) => {
            const id = req.params.id;

            const result = await queriesCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { recommendationCount: 1 } }
            );

            if (result.modifiedCount > 0) {
                res.send({ message: 'Recommendation count updated' });
            } else {
                res.status(404).send({ message: 'Query not found' });
            }
        });

        // recommendations count Decrement by patch
        app.patch('/queries/decrement/:id', async (req, res) => {
            const id = req.params.id;

            const result = await queriesCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { recommendationCount: -1 } }
            );

            if (result.modifiedCount > 0) {
                res.send({ message: 'Recommendation count updated' });
            } else {
                res.status(404).send({ message: 'Query not found' });
            }
        });


        app.delete('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await queriesCollection.deleteOne(query);
            res.send(result)
        })









        //Recommendation related Apis

        //get all recommendations
        app.get('/recommendations', async (req, res) => {
            const result = await recommendationsCollection.find().toArray();
            res.send(result);
        })

        //get Recent recommendations
        app.get('/recommendations/recent', async (req, res) => {
            try {
                const result = await recommendationsCollection
                    .find()
                    .sort({ timestamp: -1 }) // latest first
                    .limit(10)
                    .toArray();

                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ error: "Failed to fetch recent recommendations" });
            }
        });

        // get specific id by queryId from recommendation collection
        app.get('/recommendations/queryId/:id', async (req, res) => {
            const id = req.params.id;
            const query = { queryId: id };
            const result = await recommendationsCollection.find(query).toArray();
            res.send(result);
        });

        // get specific id recommendation from collection
        app.get('/recommendations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await recommendationsCollection.findOne(query);
            res.send(result);
        })

        // get recommendations by query/user/query creator email from collection
        app.get('/recommendations/creatorEmail/:email', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await recommendationsCollection.find(query).toArray();
            res.send(result);
        })

        // get recommendations by recommender email from collection
        app.get('/recommendations/recommenderEmail/:email', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const email = req.params.email;
            const query = { recommenderEmail: email };
            const result = await recommendationsCollection.find(query).toArray();
            res.send(result);
        })


        //new recommendation post in recommendation collection
        app.post('/recommendations', async (req, res) => {
            const newRecommendation = req.body;
            const result = await recommendationsCollection.insertOne(newRecommendation);
            res.send(result);
        })


        // Recommendation Delete
        app.delete('/recommendations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await recommendationsCollection.deleteOne(query);
            res.send(result)
        })











        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Alt Pick Server is cooking ')
})

app.listen(port, () => {
    console.log(`Career Code server is running on port ${port}`)
})