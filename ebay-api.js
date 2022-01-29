/** This file is the backend with node.js and express */

// Integrations
const express = require('express'); // express integration;
const cors = require("cors"); // cors integration;
const client = require('./connection.js') // integrates the connection.js file;

const app = express();
const port = 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

// connection to the database in postgresql;
client.connect();

// Array for the articles
const articles = [];

/* --> FEHLER (CORS header 'Access-Control-Allow-Origin' does not match 'xyz')

// Logging to the console;
const logger = (req, res, next) => {
    console.log(`Received Request ${new Date(Date.now()).toLocaleString('de-DE')}`);
    console.log('HTTP METHOD', req.method);
    console.log('HTTP BODY', req.body);
    console.log('URL PARAMETER', req.params);
    next();
}
app.use(logger);
*/

// Header-Informations for the browser;
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next()
})


/*
REST-API with:
    1. GET /articles - return all articles;
    2. GET /article/:id - return a specific article;
    3. POST /article - create a new article;
    4. DELETE /article/:id - delete a specific article;
    5. PUT /article/:id - update a specific article;
*/


// 1. GET-Method for getting all articles from database;
app.get('/articles', async (req, res)=>{
    // client.query(`SELECT * FROM articles`, (err, result)=>{
    //    if(!err){
    //        console.log("result");
    //       console.log(result.rows);
    //        res.json(result.rows);
    //    }
    // });

    // NEU
    const result = await client.query({
        rowMode: "object", // NICHT Text, sondern Object für Anzeige von fields und rows
        text: "SELECT * FROM articles"
    })

    console.log(result)
    res.json(result.rows)

    client.end;
})


// 2. GET-Method for one specific article/:uuid from database;
app.get('/article/:uuid', (req, res)=>{
    client.query(`SELECT * FROM articles WHERE uuid= ?`,
    [
        req.params.uuid
    ],
    (err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
    client.end;
})

/*
// 2. GET-Method for one specific article/:uuid from database;
app.get('/article/:uuid', (req, res)=>{
    client.query(`SELECT * FROM articles WHERE uuid=${req.params.uuid}`, (err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
    client.end;
})
*/

// 3. POST-Method for creating one specific article from database;
app.post('/article', (req, res)=> {
    // Writing into the database;
    const article = req.body;
    let insertQuery = `INSERT INTO articles (uuid, title, start_price, description) 
                       values(${article.uuid}, '${article.title}', '${article.start_price}', '${article.description}')`

    client.query(insertQuery, (err, result)=>{
        if(!err){
            res.send(`Insertion into the database was successful!
                        Please go back to the Mainpage!
            `);
        }
        else { 
            console.log(err.message);
            resolveBadRequest(res, 'Missing some property! You NEED uuid, title, description and start_price');
        }
    })
    client.end;
})


// 4. DELETE-Method for deleting one specifi article:uuid from the database;
app.delete('/article/:uuid', (req, res)=> {
    let insertQuery = `DELETE FROM articles WHERE uuid=${req.params.uuid}`

    client.query(insertQuery, (err, result)=>{
        if(!err){
            res.send('Deletion from database was successful');
        }
        else { 
            console.log(err.message);
            resolveNotFound(res, `The specific ${uuid} was NOT found`);
         }
    })
    client.end;
})

// 5. PUT-Method for updating one article/:uuid description from the database "articles";
app.put('/article/:uuid', (req, res)=> {
    let user = req.body;
    let updateQuery = `UPDATE articles
                       SET title = '${article.title}',
                       start_price = '${article.start_price}',
                       description = '${article.description}'
                       WHERE uuid = ${article.uuid}`

    client.query(updateQuery, (err, result)=>{
        if(!err){
            res.send('Update was successful');
        }
        else 
        { 
            console.log(err.message);
        }
    })
    client.end;
})

// Console-Output
app.listen(port, function() {
    console.log(`Running on localhost Port 8080... \n Visit your Browser or Postman! \n`);
});

// function to get the correct Article with UUID; (veraltete Lösung)
function getArticlewithUUID(uuid) {
    return articles.find((article) => article.uuid === uuid);
}

// *************************************************************************************
// function for no result --> ERROR 404;
function resolveNotFound(res, message) {
    res.statusCode = 404;
    res.send(message);
    res.end();
    return;
}

// function for bad request --> ERROR 400;
function resolveBadRequest(res, message) {
    res.statusCode = 400;
    res.send(message);
    res.end();
    return;
}
