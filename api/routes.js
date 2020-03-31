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
const users = [];
const courses = [];

//Authentication
const authenticationUser = async(req, res, next) => {
    let message = null;
    const users = await Users.findAll();
    const credentials = auth(req);
//Check credentials
    if(credentials){
        const user = users.find( u => u.emailAddress === credentials.name);

        if(user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);

            if(authenticated) {
                console.log(`Authentication successful for username: ${user.emailAddress}`);
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



//Get all users
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

//Create a new user
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
//Get all courses
router.get('/courses',  asyncHandler(async(req, res)=>{
//Excedes Expectations
    const courses = await Courses.findAll({
        include:[
            {
                model: Users,
                as: 'userName',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            },
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    });
    res.status(200).json(courses);
}));

//Get course by ID
router.get('/courses/:id', asyncHandler(async(req, res) =>{
//Excedes Expectations
    const courses = await Courses.findByPk(req.params.id,{
        include:[
            {
                model: Users,
                as: 'userName',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            },
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    });
    if(courses){
        res.status(200).json(courses).end();
    }else{
        res.status(400).json({message: 'Sorry course is not available'})
    }


}));

//Create new course
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

//Updates course
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
        //Exceeds Expectations
        if(user.id == course.userId){
            await course.update(newCourse);
            res.status(204).end();

        }else{
            res.status(403).json({message: "You cannot change other user's courses"})
        }
    }


}));

// Deletes course
router.delete('/courses/:id', authenticationUser, asyncHandler(async(req,res, next) =>{

        const course = await Courses.findByPk(req.params.id);
//Excedes Expectations
        if(course){
            await course.destroy(req.body);
            res.status(204).end();
        }
        else{
            res.status(403).json(({message: 'You cannot Delete this course'}));
        }
    }));
module.exports = router;
