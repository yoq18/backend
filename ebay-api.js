// Backend ebay-api
// Integrations
const express = require('express'); //Express integration
const cors = require("cors"); //cors integration

const app = express();
const port = 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

// Array for the articles
const articles = [];

//Logging on the console
const logger = (req, res, next) => {
    console.log(`Received Request ${new Date(Date.now()).toLocaleString('de-DE')}`);
    console.log('HTTP METHOD', req.method);
    console.log('HTTP BODY', req.body);
    console.log('URL PARAMETER', req.params);
    next();
}
app.use(logger);


/*
REST-API with:
    1. GET /articles - return all articles;
    2. GET /article/:id - return a specific article;
    3. POST /article - create a new article;
    4. DELETE /article/:id - delete a specific article;
    5. PUT /article/:id - update a specific article;
*/

//1. GET-Method for all articles;
app.get('/articles', (req, res) => {
    if (articles.length === 0) {
        resolveNotFound(res, `No articles found! Please create one. 
                            - To create one use the POST-Method please.`) //with `` multiline string
    } else {
        res.statusCode = 200;
        res.json(articles);
        res.end();
    }
});

//2. GET-Method for one specific article/:title;
/* 
app.get('/article/:title', (req, res) => {
    const { title } = req.params;
    const article = getArticle(title); 
    if (!article) { //search with "title" property --> UUID wäre auch möglich?
        resolveNotFound(res, `The specific ${title} not found`)
    } else {
        res.statusCode = 200;
        res.json(article);
        res.end();
    }
})
*/

// TESTEINTRAG! --> FUNKTIONIERT! 
app.get('/article/:uuid', (req, res) => {
    const { uuid } = req.params;
    const article = getArticlewithUUID(uuid); 
    if (!article) { //search with "uuid" property
        resolveNotFound(res, `The specific ${uuid} not found`)
    } else {
        res.statusCode = 200;
        res.json(article);
        res.end();
    }
})

// 3. POST-Method for creating one specific article;
// UUID, title, start_price, period, description 
app.post('/article', (req, res) => {
    if (!req.body.hasOwnProperty('title')) {
        resolveBadRequest(res, 'Missing the "title" property');
    }
    if (!req.body.hasOwnProperty('uuid')) {
        resolveBadRequest(res, 'Missing the "uuid" property');
    }
    if (!req.body.hasOwnProperty('start_price')) {
        resolveBadRequest(res, 'Missing the "start_price" property');
    }
    if (!req.body.hasOwnProperty('description')) {
        resolveBadRequest(res, 'Missing the "description" property');
    }
    articles.push(req.body);
    res.statusCode = 200;
    res.json(req.body);
});

// 4. DELETE-Method for deleting one article:title;
// VLLT doch besser nach UUID zu suchen (eindeutige suchnummer --> title kann öfter vorkommen)
app.delete('/article/:title', (req, res) => {
    const { title } = req.params;
    if (!title) {
        resolveBadRequest(res, 'Missing the "title" property');
    }
    const articleIndex = getProductIndex(title);
    if (articleIndex !== -1) {
        articles.splice(articleIndex, 1);
        res.statusCode = 200;
        res.send(`${title} successfully removed!`);
    } else {
        resolveNotFound(res, `The specific ${title} not found`);
    }
})

// 5. PUT-Method for updating one article/:title description;
app.put('/article/:title', (req, res) => {
    const { title } = req.params;
    if (!req.body.hasOwnProperty('description')) {
        resolveBadRequest(res, 'Missing the "description" property')
    }
    const articleIndex = getProductIndex(title)
    if (articleIndex !== -1) {
        articles.splice(articleIndex, 1, {...getArticle(title), description: req.body.description});
        res.statusCode = 200;
        res.send(`${title} description successfully updated`);
    } else {
        resolveNotFound(res, `The specific ${title} not found`);
    }
})

// Console-Output
app.listen(port, () => {
    console.log('Running...');
});

//function to get the ProductIndex
function getProductIndex(title) {
    return articles.findIndex((article) => article.title === title);
}

//function to get the correct Article;
function getArticle(title) {
    return articles.find((article) => article.title === title);
}

//function to get the correct Article with UUID;
function getArticlewithUUID(uuid) {
    return articles.find((article) => article.uuid === uuid);
}

//function for no result --> ERROR 404;
function resolveNotFound(res, message) {
    res.statusCode = 404;
    res.send(message);
    res.end();
    return;
}

//function for bad request --> ERROR 400;
function resolveBadRequest(res, message) {
    res.statusCode = 400;
    res.send(message);
    res.end();
    return;
}
