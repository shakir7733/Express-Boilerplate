const Db = require("../db/db");
const {sendMail} =require('../utils/sendEmail')
//Load Iput Validtion
const validateContactInput = require('../validations/contact');
const asyncHandler = require('../helpers/async');
const ErrorResponse = require('../utils/errorResponse');
const isEmpty = require("../validations/isEmpty");

exports.getAllContacts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.searchContacts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.getSingleContact= asyncHandler(async (req, res, next) => {
    const contact = await Db.models.contact.findOne({ where: { id: req.params.id } });
    if(contact){
        res.json({
            data: contact,
            success: true
        });
    }else{
        next(
            new ErrorResponse(`No contact with the id of ${req.params.id}`,404)
          );
    }
});


exports.addContact =asyncHandler( async (req, res, next) => {
    const{errors, isValid} = validateContactInput(req.body);
    if(!isValid){
        //If any errors send 400
        return res
            .status(400)
            .json({ error: errors, success: false, status: 400 });
    }
    const cont= {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        message:req.body.message,
        website:isEmpty(req.body.website)?req.body.website:'alpwander',
    }
    Db.models.contact.create(cont).then(contact=>{
        res.json({
            data: contact,
            success: true,
            message: "Contact successfully added"
        });
        var sendOptions = {
            to: req.body.email,
            subject: "Thanks! Your Message have been received",
            contact: cont
        };
        sendMail(req,res,next,sendOptions,'contact_email');
    })
})

exports.deleteContact =asyncHandler( async (req, res, next) => {
    const contact = await Db.models.contact.findOne({ where: { id: req.params.id } })
    if (contact) {
        await Db.models.contact.destroy({ where: { id: req.params.id } })
        res.json({
            data: null,
            success: true,
            message: "Contact successfully deleted"
        });
    } else {
        next(
            new ErrorResponse(`No contact with the id of ${req.params.id}`,404)
        );
    }
});