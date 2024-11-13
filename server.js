// ajout des configuration
import 'dotenv/config';

import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
// import {connexion } from './db/db.js';
import { engine } from 'express-handlebars';
import { getAllExchanges, getUserExchanges, deleteEchange, getAllBriques, createExchange, getEchangeDetails, calculValeurGlobaleApprox} from './model/echanges.js';
import { validateBriques, validateId,validateName} from './Validation.js';
// creation du server

const app = express();

// ajout des engins
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Ajout de middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static('public'));
app.use('/assets', express.static('assets'));


// programmation des routes pour les handlebars
// route pour la generation de la page d'accueil 
app.get('/', async (request, response) => {

    response.render('Home', {
        titre: 'Accueil',
        styles: [''],
        scripts :['/js/Home.js'],
        Exchanges: await getAllExchanges()
    });
});

// route pour la generation de la page html contenant tout les échanges du compte courant
app.get('/echangesUser', async (request, response) => {

    const id = 1;
    response.render('profil', {
        titre: 'Échanges Utilisateur',
        styles: ['/css/Profil.css'],
        scripts :['/js/profil.js'],
        exchangesUser: await getUserExchanges(id)
      
    });
});

// route pour voir l'échanges

// route pour la generation de la page html permettant de creer un échange
app.get('/createEchange', async (request, response) => {


    response.render('createEchange', {
        titre: 'Création de l\'échange',
        styles: ['/css/createEchange.css'],
        scripts :['/js/createEchange.js'],
        Briques : await getAllBriques()
    });
});
// route pour la generation de la page html pour voir un échange  spécifique
app.get('/echange/:id', async (request, response) => {
        const id = request.params.id;


    response.render('echange', {
        titre: 'Échange',
        styles: ['/css/echange.css'],
        scripts :['/js/echange.js'],
        Exchange : await getEchangeDetails(id) 
    });
});





// fin de la programmation des routes du handlebars

// programmation de route 

// methode pour recupere les echanges de tous les utlisatuers
app.get ('/api/echanges', async (req, res)=>{

        const echanges = await getAllExchanges();
        res.status(200).json( echanges);
    
});

// Route pour récupérer les échanges de l'utilisateur avec l'ID 1
app.get('/api/echangesUser/:id', async (req, res) => {

        const id = req.params.id;
       if ( validateId( parseInt(id))){
        const echanges = await getUserExchanges(id);
        res.status(200).json(echanges);
       } 
       else{
        res.status(400).end();
       }   
});




// route pour suppression d'un échnage
app.delete('/api/echange/:id', async (req, res) => {
    
    const id = req.params.id;

    if (validateId(parseInt(id))) {
        const isDeleted = await deleteEchange(id);
        if(isDeleted){
            res.status(200).json({ message: 'Échange supprimé avec succès' });
        }
        else {
             res.status(404).json({ message: "Échange non trouvé" });
        }
    }
    else{
        res.status(400).end();
    }
});


// Route pour obtenir toutes les briques disponibles
app.get('/api/briques', async (req, res) => {
    try {
        const briques = await getAllBriques();
        res.status(200).json(briques);
    } catch (error) {
        console.error("Erreur lors de la récupération des briques:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Route pour créer un échange
app.post('/api/echange', async (req, res) => {

    const name = req.body.nameEchange; 
    const briques = req.body.briques; 
   
    if(validateName(name) && validateBriques(briques)){
        const echangeId = await createExchange(name, briques);
        res.status(201).json({ message: "Échange créé avec succès", echangeId });
    }
    res.status(400).end();    
});

// Route pour récupérer les détails d'un échange spécifique
app.get('/api/echangeDetails/:id', async (req, res) => {
    const idEchange = req.params.id; 

    if (validateId(parseInt(idEchange))) {
        const detailsEchange = await getEchangeDetails(idEchange);
        res.status(200).json(detailsEchange);
    }
    res.status(400).end();
});

// Route pour afficher la valeur globale approximative de l'échange
app.get('/api/echangeValeurApprox/:id', async (req, res) => {
    const idEchange = req.params.id;
    if (validateId(parseInt(idEchange))) {
        const valeurGlobale = await calculValeurGlobaleApprox(idEchange);
        res.status(200).json({valeurGlobale})
    }
    res.status(400).end();
});





// demarage du server
console.log('Serveur démarré:');
console.log('http://localhost:' + process.env.PORT);
app.listen(process.env.PORT);
