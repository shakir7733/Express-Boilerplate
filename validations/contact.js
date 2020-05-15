const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports= function validateContactInput(data){
	let errors ={};

	data.name = !isEmpty(data.name)? data.name : '';
	data.email = !isEmpty(data.email)? data.email : '';
	data.phone = !isEmpty(data.phone)? data.phone : '';
	data.message = !isEmpty(data.message)? data.message : '';


	if(Validator.isEmpty(data.name)){
		errors.name = 'Name Field is required';
	}
	if(Validator.isEmpty(data.email)){
		errors.email = 'Email Field is required';
	}
	if(Validator.isEmpty(data.phone)){
		errors.phone = 'Phone Field is required';
	}
	if(Validator.isEmpty(data.message)){
		errors.message = 'Message Field is required';
	}

	return{
		errors,
		isValid: isEmpty(errors)
	}
}