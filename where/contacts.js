const isEmpty = require('../validations/isEmpty');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (data) =>{
    const {
		website
    } = data;
    console.log(data)
    const newName = isEmpty(website) ? "" : website;
    
	let where = {
		website: {
			[Op.iLike]: `%${newName}%`
		}
    };
    
    return where;
}