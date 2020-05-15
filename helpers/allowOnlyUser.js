'use strict';
let allowOnly ;
const {roles} = require('./getAccess');

const accessLevels = {
    guard: roles.guard | roles.admin | roles.super_admin | roles.god,    // ...111
    admin: roles.admin | roles.super_admin | roles.god,                       // ...110
    super_admin: roles.super_admin | roles.god,                                        // ...100
    god: roles.god                                        // ...100
};


module.exports = (accessType,accessName, callback)=>{
    const checkUserRole = async (req, res,next) => {
        const Db = require("../db/db");
        const user = await Db.models.user.findOne({where:{id:req.user.id}});
        const {own} = req.user.access.auth;
        const {role,id} = req.user;
        const newRole =req.body.role;
        const newId = parseInt(req.body.id);
        if(accessName==='delete'){
            if(newRole ==='god'){
                res.status(403)
                .json({ error: 'Unauthorized', success: false, status: 403 });
                return;
            }
            if(role !=='god'){
                if(role !== 'super_admin'){
                    if(id !== newId){
                        res.status(403)
                        .json({ error: 'Unauthorized', success: false, status: 403 });
                        return;
                    }
                }
                if(role === 'super_admin' && newRole === 'super_admin'){
                    if(id !== newId){
                        res.status(403)
                        .json({ error: 'Unauthorized', success: false, status: 403 });
                        return;
                    }
                }
            }
        }
        if(accessName==='update' && role !=='god'){
            if(newRole ==='god' ){
                res.status(403)
                .json({ error: 'Unauthorized', success: false, status: 403 });
                return;
            }
            if(role !== 'super_admin'){
                if(id !== newId){
                    res.status(403)
                    .json({ error: 'Unauthorized', success: false, status: 403 });
                    return;
                }
            }
            if(role === 'super_admin' && newRole === 'super_admin'){
                if(id !== newId){
                    res.status(403)
                    .json({ error: 'Unauthorized', success: false, status: 403 });
                    return;
                }
            }
        }
        if(!user.access[accessType][accessName] && id !== newId){
            res.status(403)
            .json({ error: 'Unauthorized', success: false, status: 403 });
            return;
        }
        callback(req, res,next);
    }
    return checkUserRole;
};