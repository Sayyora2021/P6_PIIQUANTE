//importer le package pour utiliser les variables d'environnement
const dotenv = require ('dotenv').config('../.env')
console.log(dotenv)
const express = require ('express');
const helmet =require ('helmet');
const mongoose = require('mongoose');
const path=require('path');
const stuffRoutes =require('./routes/stuff');
const userRoutes = require('./routes/user');



//installation de mongoDB
const {DB_USER, DB_PASSWORD, DB_CLUSTER_NAME}= process.env;
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER_NAME}
.mongodb.net/test?retryWrites=true&w=majority`,

//mongoose.connect('mongodb+srv://ps:sapa@cluster0.2efuami.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
console.log(process.env.DB_User);
const app = express();

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));

//pour que 2 ressources 3000 et 4200 communique entre eux, on rajoute des headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/api/sauces', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;