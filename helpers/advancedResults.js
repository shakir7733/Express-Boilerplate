const getPages = require('./getPages');
const isEmpty = require('../validations/isEmpty');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const {
    getNextDay,
    getYesterDay,
    getWeek,
    getMonth
    } = require('./getTime')

const advancedResults =(model,name,whatToday=null,search=null)=>async (req, res, next) =>{
    let query;
    let today = getYesterDay();
    let nextDay = getNextDay();
    let month = getMonth();
    let week = getWeek();
    
    // Copy req.query
    const reqQuery = { ...req.query };
    const { no, size, offset } = getPages(reqQuery);
    let where = null; 
    
    if(whatToday === 'today'){
        where = {
            createdAt: {
                [Op.gt]: today,
                [Op.lt]: nextDay
            }
        };
    }else if(whatToday === 'week'){
        where = {
            createdAt: {
                // [Op.lt]: today,
                [Op.lt]: nextDay,
                [Op.gt]: week,
            }
        };
    }
    else if(whatToday === 'month'){
        where = {
            createdAt: {
                // [Op.lt]: today,
                [Op.lt]: nextDay,
                [Op.gt]: month
            }
        };
    }

    if(search){
        where=search(req.body,model,res);
    }
    query = model.findAndCountAll({
                order: [["createdAt", "DESC"]],
                offset: offset,
                where,
                limit: size,
            }).catch(err=>{
                next(err);
            })
    const results= await query;
    
    // console.log(results)
    if(isEmpty(results)){
        res.status(404).json({
            success: false,
            status: 404,
            error: `No ${name} Found`
        });
        next();
        return false
    }
    const {rows,count} =results
    res.advancedResults = {
        success: true,
        page: { total: count, currentPage: no, pageSize: size },
        data: rows
      };
    next();
}


module.exports = advancedResults;