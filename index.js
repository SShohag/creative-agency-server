const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgdls.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('servicesPhoto'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send('hello this is mongodb')
})
//main part of server site
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("services")

  app.post('/addReview', (req, res)=>{
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.get('/userReviews', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });
  
  app.post('/addOrder', (req, res) => {
      const order = req.body;
      orderCollection.insertOne(order)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  });

  app.get('/order', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.get('/totalOrders', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/addService', (req, res) => {
    const file = req.files.file;

    const title = req.body.title;
    const description = req.body.description;
    //4:39 to .........
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({title, description, image})
    .then(result => {
      res.send(result.insertedCount > 0);
    })

    // console.log(title, description, file)

    // file.mv(`${__dirname}/servicesPhoto/${file.name}`, err => {
    //   if(err){
    //     console.log(err)
    //     return res.status(500).send({msg: 'Failed to upload Image in the server'})
    //   }
    //   return res.send({name: file.name, path: `/${file.name}`})
    // })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

});


app.listen(process.env.PORT || port);