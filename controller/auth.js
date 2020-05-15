const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../config/keys");
const Db = require("../db/db");
const isEmpty = require("../validations/isEmpty");
const path = require("path");
var multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../helpers/async');
const {sendMail} =require('../utils/sendEmail')
const ErrorResponse = require('../utils/errorResponse');

//Load Input Validation
const validateRegisterInput = require("../validations/register");
const validateLoginInput = require("../validations/login");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.getAllUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.forgotPassword = asyncHandler(async(req,res,next) =>{
    Db.models.user
        .findOne({where:{email:req.body.email}})
        .then(async user=>{
            if(user){
                const token = uuidv4();
                user.resetpasswordtoken = token;
                user.resetpasswordexpires = new Date().getTime() + 36000 // 1 hour
                await user.save();
                // sendMail(user.email, token);
                const base = "http://localhost:3000/reset/token/" + token;
                var mailOptions = {
                    to: req.body.email,
                    subject: "Reset Password ",
                    base:base,
                    body: `<p>You are receiving this because you (or someone else) have requested 	  the reset of the password for your account.
                    Please click on the following link, or paste this into your browser to   		complete the process:
                        ${base}
                        If you did not request this, please ignore this email and your password will     remain unchanged<p>`,
                };
                // Send email.
                sendMail(req,res,next,mailOptions,'reset');
                res.json({
                    message: "Reset password token sent successfully please check your email",
                    success: true
                });
            }else{
                next(new ErrorResponse('No user with this email found',404))
            }
        })
})


exports.changeForgotPassword = asyncHandler(async (req,res,next)=>{
    Db.models.user.findOne({where:{resetpasswordtoken: req.params.token}}).then(async (user)=>{
        if (!user || user.resetpasswordexpires < Date.now().getTime()){
            res.status(404).json({
                success: false,
                status: 404,
                error: "Reset password token is invalid or expired"
            });
            return;
        }
        const salt = bcrypt.genSaltSync();
        user.password =  bcrypt.hashSync(req.body.password, salt);
        user.resetpasswordtoken = null;
        user.resetpasswordexpires = null;
        await user.save();

        res.send({
            data: user,
            success: true,
            message: "Password Changed"
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
})

exports.changePassword = asyncHandler(async(req,res,next)=>{
    Db.models.user.findOne({where:{id:req.params.id}})
    .then(async user=>{
        if(user){
            if(user.id !== req.user.id && req.user.role !== 'god' ){
                next(new ErrorResponse("Unauthorized",401));
                return false;
            }
            const isEqual = await bcrypt.compare(req.body.old_password,user.password);
            const newEqual =await bcrypt.compare(req.body.password,user.password);
            if(!isEqual){
                next(new ErrorResponse("Old Password is incorrect",404));
                return
            }
            if(newEqual){
                next(new ErrorResponse("New password cannot be old password",404));
                return;
            }
            if(req.body.password !== req.body.password2){
                next(new ErrorResponse("Password do not match",404));
                return;
            }
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(req.body.password, salt);
            // user.password=args.password
            await user.save()
            res.send({
                data: user,
                success: true,
                message: "Password Changed"
            });
        }else{
            next(new ErrorResponse('No user with this id found',404))
        }
    })
})

exports.getSingleUser = asyncHandler(async(req, res, next) => {
    Db.models.user
        .findOne({ where: { id: req.params.id } })
        .then(async user => {
            if (user) {
                res.json({
                    data: user,
                    success: true
                });
            } else {
                next(new ErrorResponse('No user with this id found',404))
            }
        })
});

exports.registerUser = asyncHandler(async(req, res, next) => {
    const { errors, isValid } = validateRegisterInput(req.body);
        if (!isValid) {
            return res
                .status(400)
                .json({ error: errors, success: false, status: 400 });
        }
        const user_username =await Db.models.user.findOne({ where: { user_name: req.body.user_name } })
        const user_email = await Db.models.user.findOne({ where: { email: req.body.email } });
        if(user_username){
            return next(new ErrorResponse("Username Already Exist" ,400))
        }
        if(user_email){
            return next(new ErrorResponse("Email Already Exist" ,400))
        }
        Db.models.user.create({
                user_name: req.body.user_name,
                name: req.body.name,
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                phone: req.body.phone,
                role: req.body.role
            })
            .then(user => {
                res.json({
                    data: user,
                    success: true,
                    message: "User successfully added"
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
});

exports.userLogin = asyncHandler(async(req, res, next) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res
            .status(400)
            .json({ success: false, status: 400, error: errors });
    }
    const email = req.body.email;
    const password = req.body.password;

    // Find the User by email
    Db.models.user
        .findOne({ where: { email: email } })
        .then(async user => {
            // Check for User
            if (!user) {
                errors.email = "User not found";
                return res
                    .status(404)
                    .json({ error: errors, success: false, status: 404 });
            }

            //Check for Password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    //User Matched
                    const payload = {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                    };
                    //Sign Token
                    jwt.sign(
                        payload,
                        key.secretOrKey,
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) {
                                if (!err.statusCode) {
                                    err.statusCode = 500;
                                }
                                next(err);
                            } else {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                            }
                        }
                    );
                } else {
                    errors.password = "Incorrect Password";
                    return res.send(400, {
                        status: 400,
                        error: errors,
                        success: false
                    });
                }
            });
        })
});

exports.postAccess = asyncHandler(async(req, res, next) => {
    Db.models.user
        .findOne({ where: { id: req.params.id } })
        .then(async user => {
            if (user) {
                Db.models.user
                    .update({access:req.body.access}, {
                        where: { id: req.params.id },
                        returning: true
                    })
                    .then(user => {
                        res.send({
                            data: user[1],
                            success: true,
                            message: "Access Successfully Edited"
                        });
                    })
                    .catch(err => {
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    });
            } else {
                next(new ErrorResponse("User not Found",400))
            }
        });
});

exports.editUser=asyncHandler(async(req,res,next)=>{
    const user = await Db.models.user.findOne({where:{id:req.params.id}});

    if(user){
        const user_username = await Db.models.user.findOne({ where: { user_name: req.body.user_name,id: { [Op.not]: req.params.id}} })
        const user_email = await Db.models.user.findOne({ where: { email: req.body.email ,id: { [Op.not]: req.params.id} } });
        if(user_username){
            next(new ErrorResponse("Username Already Exist" ,400))
        }
        if(user_email){
            next(new ErrorResponse("Email Already Exist" ,400))
        }
        let Variable = {
            user_name: req.body.user_name,
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
            role: req.body.role
        };
        Db.models.user
            .update(Variable, {
                where: { id: req.params.id },
                returning: true
            })
            .then(user => {
                res.send({
                    data: user,
                    success: true,
                    message: "User Successfully Edited"
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });

    }else{
        next(new ErrorResponse('No user with this id found',404)) 
    }
});

exports.deleteUser = asyncHandler(async(req, res, next) => {
    const user = await Db.models.user.findOne({where:{id:req.params.id}});
    if(user){
        Db.models.user
        .destroy({ where: { id: req.params.id } })
        .then(() =>
            res.json({
                data: null,
                message:"User successfully deleted",
                success: true
            })
        )
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }else{
        next(new ErrorResponse('No user with this id found',404)) 
    }
});

// Set Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/users");
    },
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    }
});

// Init Upload
const upload = multer({
    storage: storage
}).single("photo");

exports.editImage = (req, res, next) => {
    // var currUpload = uploadFnc('Users');
    
    upload(req, res, err => {
        if (err) {
            return res.status(400).json(err);
        } else {
            let img;
            img =
                req.protocol + "://" + req.get("host") + req.file.path.slice(6);
                
            Db.models.user
                .findOne({ where: { id: req.params.id } })
                .then(user => {
                    if (user) {
                        if (!isEmpty(user.photo)) {
                            imageDeletePath(user.photo);
                        }
                        Db.models.user
                            .update(
                                {
                                    photo: img
                                },
                                {
                                    where: { id: req.params.id },
                                    returning: true
                                }
                            )
                            .then(user => {
                                res.send({
                                    data: user,
                                    success: true,
                                    message: "Successfully Image Uploaded"
                                });
                            })
                            .catch(err => {
                                if (!err.statusCode) {
                                    err.statusCode = 500;
                                }
                                next(err);
                            });
                    } else {
                        imageDeletePath(req.file.path);
                        next(new ErrorResponse("User not found" ,400))
                    }
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                });
        }
    });
};

exports.deletePhoto = (req, res, next) => {
    Db.models.user
        .findOne({ where: { id: req.params.id } })
        .then(user => {
            if (user) {
                if (req.user.id === user.id) {
                    const b = req.protocol + "://" + req.get("host");
                    let img = user.photo.slice(b.length);
                    fs.unlink("./public" + img, err => {
                        if (err) {
                            if (!err.statusCode) {
                                err.statusCode = 500;
                            }
                            next(err);
                        }
                        return res.send({
                            data: null,
                            success: true,
                            message: "Successfully Deleted User"
                        });
                    });
                } else {
                    next(new ErrorResponse("Unauthorized" ,401))
                }
            } else {
                next(new ErrorResponse("User not found" ,400))
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

const imageDelete = path => {
    return fs.unlink("./public" + path, err => {
        if (err) {
            console.log(err);
            return false;
        }
        return true;
    });
};
const imageDeletePath = path => {
    return fs.unlink(path, err => {
        if (err) {
            console.log(err);
            return false;
        }
        return true;
    });
};
