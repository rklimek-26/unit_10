'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const router = express.Router();
const Users = require('./models').Users;
const Courses = require('./models').Courses;

function asyncHandler(cb){
    return async(req, res, next) =>{
        try{
            await cb(req, res, next)
        }catch(error){
            res.status(500).send(error);
        }
    }
}


//this array is used to keep track of user + course records
const users = [];
const courses = [];

//Authentication
const authenticationUser = async(req, res, next) => {
    let message = null;
    const users = await Users.findAll();
    const credentials = auth(req);

    // Look for a user whose `username` matches the credentials `name` property.
    if(credentials){
        const user = users.find( u => u.emailAddress === credentials.name);

        if(user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);

            if(authenticated) {
                console.log(`Authentication successful for username: ${user.emailAddress}`);
                // Store the user on the Request object.
                req.currentUser = user;
            }else{
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
        } else{
            message = `User not found for username: ${credentials.name}`;
        }
      }  else{
            message = 'Auth header not found';
        }
        if(message){
            console.warn(message);

        res.status(401).json( {message: 'Access Denied'});
        }else{
            next();
        }

};



// Send a GET request to /users to READ a list of users
router.get('/users', authenticationUser, asyncHandler( async(req,res) => {
    const user = req.currentUser;
    const users = await Users.findByPk(user.id, {
        attributes:{
            exclude:[
                'password',
                'createdAt',
                'updatedAt'
            ],
        }
    });
    res.status(200).json(users);
}));

// Send a POST request to /users
router.post('/users',  [
    check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "lastName"'),

    check('emailAddress')
        .exists( {checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "emailAddress"')
        .isEmail()
        .withMessage('Please provide a valid email address'),

    check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "password"'),
], asyncHandler(async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json( { errors: errorMessages });
    }else{
        const user = req.body;

        user.password = bcryptjs.hashSync(user.password);
        await Users.create(req.body);

        return res.status(201).location('/').end();
    }
}));

// Send a GET request to /courses
router.get('/courses',  asyncHandler(async(req, res)=>{
    const courses = await Courses.findAll({
      //Excedes Expectations
	attributes: {
      exclude: [
        'createdAt',
        'updatedAt'
      ]
    },
    include: [{
        model: User,
        attributes: {
          exclude: [
            'password',
            'createdAt',
            'updatedAt'
          ]
        },
      },

    ],
  });
    res.status(200).json(courses);
}));

//Send a GET request to /courses:id
router.get('/courses/:id', asyncHandler(async(req, res) =>{
    const courses = await Courses.findByPk(req.params.id,{
      //Excedes Expectations
	  attributes: {
      exclude: [
        'createdAt',
        'updatedAt'
      ]
    },
    include: [{
      model: User,
      attributes: {
        exclude: [
          'password',
          'createdAt',
          'updatedAt'
        ]
      },
    }, ],
  });

    if(courses){
        res.status(200).json(courses).end();
    }else{
        res.status(400).json({message: 'Sorry course is not available'})
    }


}));


// Send a POST request to /courses to create a new course
router.post('/courses', [
    check('title')
        .exists( { checkNull: true, checkFalsy: true})
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists( { checkNull: true, checkFalsy: true})
        .withMessage('Please provide text for "description"')
], authenticationUser,  asyncHandler(async(req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json( { errors: errorMessages } );
    }else{
        const courses = await Courses.create(req.body);
        return res.status(201).location('courses/' + courses.id).end();
    }
}));

// Send a PUT request to /courses to update an existing course
router.put('/courses/:id', [
    check('title')
        .exists( { checkNull: true, checkFalsy: true } )
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists( {checkNull: true, checkFalsy: true} )
        .withMessage('Please provide a value for "description"'),
    check('userId')
        .exists( {checkNull: true, checkFalsy: true} )
        .withMessage('Please provide a value for "userId"')

], authenticationUser, asyncHandler(async(req,res, next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const errorMessages = errors.array().map(error => error.msg);
        res.status(400).json({ errors: errorMessages });
    } else{
        const user = req.currentUser;
        const course = await Courses.findByPk(req.params.id);
        const newCourse ={
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded
        }
        //Excedes Expectations
        if(user.id == course.userId){
            await course.update(newCourse);
            res.status(204).end();

        }else{
            res.status(403).json({message: "You cannot change other user's courses"})
        }
    }


}));

// Send a DELETE request to /courses/:id to update an existing course
router.delete('/courses/:id', authenticationUser, asyncHandler(async(req,res, next) =>{

        const course = await Courses.findByPk(req.params.id);
        if(course){
            await course.destroy(req.body);
            res.status(204).end();
        }
        else{
            res.status(403).json(({message: "You cannot Delete other user's courses"}));
        }
    }));
module.exports = router;
