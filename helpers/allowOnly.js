'use strict';
let allowOnly ;
const {getAccess} = require('./getAccess');
const Db = require("../db/db");

module.exports = (accessType,accessName, callback)=>{
    const checkUserRole = async (req, res,next) => {    
        const user = await Db.models.user.findOne({where:{id:req.user.id}});
        if(!user.access[accessType][accessName]){
            res.status(403)
            .json({ error: 'Unauthorized', success: false, status: 403 });
            return;
        }
        callback(req, res,next);
    }
    return checkUserRole;
};