const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const checkSignup = require('../middleware/check-signup');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if(result){
                const token = jwt.sign(
                {
                    email: user[0].email,
                    userId: user[0]._id
                }, 
                process.env.JWT_KEY, 
                {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            }
            return res.status(401).json({
                message: 'Auth failed'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
           message: err
        });
    });
});

router.post('/signup', upload.single('avatar'), (req, res, next) => {

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
    }


    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err){
            return res.status(500).json({
                error: err
            });
        }else{
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash,
                avatar: req.file.path
            });
            user
            .save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'User created'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    message: 'Invalid email'
                })
            });
        }
    });

});

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/', (req, res, next) => {
    User.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return {
                    email: doc.email,
                    password: doc.password,
                    avatar: doc.avatar,
                    _id: doc._id,
                    delete: {
                        type: 'DELETE',
                        url: 'http://localhost:6969/user/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;