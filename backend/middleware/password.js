//importation de password-validator
const passwordValidator = require('password-validator');

//creation de schema
let passwordSchema = new passwordValidator();

//le schema pour respecter le mdp
passwordSchema
.is().min(4)                                       //min length 4
.is().max(10)                                    //max length 10
.has().uppercase()                               //must have uppercase
.has().lowercase()                               //must have lowercase
.has().digits(2)                                //must have 2 difits (2 chiffres)
.has().not().spaces()                           //No spaces
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty1', 'Azerty2']); //Blacklist these values
//userSchema.plugin(passwordValidator);

//console.log("passwordSchema", passwordSchema)

module.exports =(req, res, next)=> {
    if(passwordSchema.validate(req.body.password)){
        next();
    }else{
       res.status(400).json({error: "Le mot de pass n'est pas assez fort:"+ passwordSchema.validate('req.body.password', { list: true })});
    }
};