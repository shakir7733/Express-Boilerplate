const express = require('express');
const router = express.Router();
const passport = require('passport');
const {getAccess,accessType} = require('../../../helpers/getAccess')
const allowOnlyUser = require('../../../helpers/allowOnlyUser');
const advancedResults = require('../../../helpers/advancedResults')
const Db =require('../../../db/db')

const authController = require('../../../controller/auth')

// @route Get api/users/test 
// @desc Tests users Routes 
// @access Public 
router.get('/test',(req,res)=> res.json({msg:"Users Works"}));


/**
 * @swagger
 * /api/v1/users/:
 *  get:
 *    description: Get request all users
 *    responses:
 *      '200':
 *        description: A successful response
 */
// @route Get All User api/v1/users/
router.get('/',
		passport.authenticate('jwt',{ session:false }),
		advancedResults(Db.models.user,'Users'),
		allowOnlyUser(getAccess.auth,'read',authController.getAllUsers));
		
// @route Get Single User api/v1/users/all/:id
router.get('/:id',
		passport.authenticate('jwt',{ session:false }),
		allowOnlyUser(getAccess.auth,'read',authController.getSingleUser));


// @route Get api/users/register 
// @desc Register User 
// @access Public 
router.post('/register',
	passport.authenticate('jwt',{ session:false }),
	allowOnlyUser(getAccess.auth,'write',authController.registerUser));

// @route Get api/users/login
// @desc Login User / Returning JWT Token
// @access Public
router.post('/login',authController.userLogin);

router.post('/forgot-password',authController.forgotPassword);
router.post('/change-forgot-password/:token',authController.changeForgotPassword);

// @route Get api/users/change 
// @desc Register User 
// @access Public 
router.put('/:id/change-password',
		passport.authenticate('jwt',{ session:false }),
		allowOnlyUser(getAccess.auth,'own',authController.changePassword));

// @route Get api/users/register 
// @desc Register User 
// @access Public 
router.put('/:id',
		passport.authenticate('jwt',{ session:false }),
		allowOnlyUser(getAccess.auth,'update',authController.editUser));

// @route Get api/users/current
// @desc Return Current User
// @access Private
router.get('/current',passport.authenticate('jwt',{ session:false }), (req,res)=>{
	res.json({
		id:req.user.id,
		name:req.user.name,
        email:req.user.email,
        role:req.user.role
	});
} );

// @route Delete  api/posts/:id 
// @desc Delete Post  
// @access Private 
router.delete('/:id',
		passport.authenticate('jwt',{session:false}),
		allowOnlyUser(getAccess.auth,'delete',authController.deleteUser));

router.post('/upload/:id',
		passport.authenticate('jwt',{session:false}),
		allowOnlyUser(getAccess.auth,'update',authController.editImage));

router.post('/access/:id',
		passport.authenticate('jwt',{session:false}),
		allowOnlyUser(getAccess.auth,'update',authController.postAccess));

router.delete('/photo/:id',passport.authenticate('jwt',{session:false}),authController.deletePhoto)

module.exports = router;