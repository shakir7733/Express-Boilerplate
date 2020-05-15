const isEmpty = require('../validations/isEmpty');
const {getNextDay} = require('../helpers/getTime');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (data) =>{
    const {
		name,
		fromDate,
		toDate,
		addedBy,
		status,
		email,
		phone,
		editedBy
    } = data;
    
	const newName = isEmpty(name) ? "" : name;
	const newPhone = isEmpty(phone) ? "121212" : phone;
	const newEmail = isEmpty(email) ? "" : email.toLowerCase();
	const newAdded = isEmpty(addedBy) ? "" : addedBy.toLowerCase();
	const newStatus = isEmpty(status) ? null : status;
	const newEdited = isEmpty(editedBy) ? "" : editedBy.toLowerCase();
	const newFromDate = isEmpty(fromDate)
		? new Date("2019/12/12")
		: getDate(fromDate);
	const newToDate = isEmpty(toDate) ? getNextDay() : getDate(toDate);
	// console.log(req.body)
	let where = {
		name: {
			[Op.iLike]: `%${newName}%`
		},
		// status: isEmpty(newStatus)
		// 	? {
		// 			[Op.iLike]: `%${newStatus}%`
		// 	  }
		// 	: newStatus,
		// status:newStatus,
		email: {
			[Op.iLike]: `%${newEmail}%`
		},
		// phone:newPhone,
		createdAt: {
			[Op.gt]: newFromDate,
			[Op.lt]: newToDate
		},
		addedBy: {
			name: {
				[Op.iLike]: `%${newAdded}%`
			}
		},
		// editedBy: {
		// 	name: {
		// 		[Op.iLike]: `%${newEdited}%`
		// 	}
		// }
    };
    
    return where;
}