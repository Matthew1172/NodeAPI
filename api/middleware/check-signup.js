const User = require('../models/user');

module.exports = (req, res, next) => {

    User.findOne({email: req.body.email}, function(err, user){
        if(err){
        return res.status(500).json({
            message: err
         });
        }
        if(user){
            return res.status(409).json({
                message: 'Email exists'
            });
        }
    });

    if(req.body.password.length < 8){                
        return res.status(401).json({
            message: 'Password too short'
        });
    } else {
        next(); 
    }

    /*
    User.find({email: req.body.email})
    .exec()
    .then(user => {

        if(user){
            return res.status(409).json({
                message: 'Email exists'
            });
        }
        if(req.body.password.length < 8){                
            return res.status(401).json({
                message: 'Password too short'
            });
        }
            
        next();
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
           error: err
        });
    });
    */
};