const Sauce = require('../models/Sauce');
const fs =require('fs');
const { update } = require('../models/Sauce');


//créé et enregistre/rajoute image
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  //delete sauceObject._userId;
  const sauce = new Sauce ({
    ...sauceObject,
  //  userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersDisliked: [" "]
  });
    sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'
  });
  
}
  )
  .catch(error => { res.status(400).json( { error : error})})
};

//renvoie un tableau de sauces
exports.getAllSauces =(req, res, next)=>{
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//récupère une seule sauce
exports.getOneSauce =(req, res, next)=>{
  Sauce.findOne({
   _id: req.params.id
 }).then(
   (sauce) => {
     res.status(200).json(sauce);
   }
 ).catch(
   (error) => {
     res.status(404).json({
       error: error
     });
   }
 );
};


//modifie la sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};


//supprime la sauce
exports.deleteSauce = (req, res, next) => {
   Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
              
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
             
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};


//POST like et dislike
exports.sauceLike = (req, res, next) => {
  //On récupère la sauce dans la BDD par son ID
  Sauce.findOne({ _id: req.params.id }) 
    .then((sauce) => {
      //L'instruction switch évalue une expression et selon le résultat obtenu et le cas associé, exécute les instructions correspondantes.
      switch (req.body.like) {
        case 1:
          //---------------Si l'utilisateur clique sur like--------------------------

          //Si user n'est pas dans le tableau des users ayant liké et qu'il a aimé la sauce donc like =1
          if (!sauce.usersLiked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On incrémente le champ like a la forme suivante :{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
                $inc: { likes: 1 },  
                //on met user dans le tableau des usersLiked
                $push: { usersLiked: req.body.userId }, 
                //L'opérateur  $push ajoute une valeur spécifiée à un tableau et a la forme :{ $push: { <field1>: <value1>, ... } }
              }
            ) 
              .then(() => {res.status(201).json({ message: ' Vous aimez cette sauce' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
          break;
        //---------------Si l'utilisateur clique sur dislike-----------------------
        case -1:
          //Si user n'est pas dans le tableau des users ayant disliké et qu'il n'a pas aimé la sauce donc dislike =1 
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BDD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //Pas de request dislike
                $inc: { dislikes: 1 }, 
                $push: { usersDisliked: req.body.userId }, 
                //L'opérateur  $push ajoute une valeur spécifiée à un tableau et a la forme :{ $push: { <field1>: <value1>, ... } }
              }
            )
              .then(() => {res.status(201).json({ message: ' vous n aimez pas cette sauce' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
          break;
        //---------------Si l'utilisateur change d'avis-----------------------
        case 0:
          //Si c'est un like
          //Si user est dans le tableau des users ayant liké et que le like est à 0, donc s'il n'aime plus la sauce
          if (sauce.usersLiked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BD
            Sauce.updateOne(
              { _id: req.params.id },
              {$inc: { likes: -1 }, //on incrémente -1, car user n'aime plus la sauce
              $pull: { usersLiked: req.body.userId }, //L'opérateur $pull supprime d'un tableau existant toutes 
                //les instances d'une valeur ou de valeurs qui correspondent à une condition spécifiée.
              }
            )
              .then(() => {res.status(201).json({ message: ' vous avez retiré votre vote like' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            //Si c'est un unlike
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On décrémente le champ like
                $inc: { dislikes: -1 }, 
                //on met user dans le tableau des usersDisliked
                $pull: { usersDisliked: req.body.userId }, 
              }
            )
              .then(() => {res.status(201).json({ message: ' vous avez retiré votre vote dislike' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
          break;
        default:
          res.status(401).json({ message: 'Ce type de vote nest pas authorisé '});
      }
    });
  }