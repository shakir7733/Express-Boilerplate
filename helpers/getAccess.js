const db  = require('../db/db');

exports.getAccess= {
    auth:'auth',
}

exports.accessType = {
    read:'read',
    write:'write',
    update:'update',
    delete:'delete',
    own:'own',
}

const acc = {
    read:'read',
    write:'write',
    update:'update',
    delete:'delete',
    own:'own',
}

exports.roles = {
    god:'god',
    super_admin:'super_admin',
    admin:'admin',
    guard:'guard',
}

exports.all=()=>{
    const accessType = this.accessType;
    const access = db.models;
    let totalAccess={};
    Object.keys(access).map(item=>{
        let av = accessType;
        Object.keys(accessType).map(item=>{av[item]=true});
        totalAccess[access[item]]=av;
    });
    return totalAccess;
}

exports.none=()=>{
    const accessType = this.accessType;
    const access = db.models;
    let totalAccess={};
    Object.keys(access).map(item=>{
        let av = accessType;
        Object.keys(accessType).map(item=>{
                if(item === acc.read || item===acc.own){
                    av[item]=true;
                }else{
                    av[item]=false
                }
            });
        totalAccess[access[item]]=av;
    });
    return totalAccess;
}