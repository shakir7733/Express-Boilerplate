const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports= function validateRegisterInput(data){
	let errors ={};

	data.name = !isEmpty(data.name)? data.name : '';
	data.user_name = !isEmpty(data.user_name)? data.user_name : '';
	data.email = !isEmpty(data.email)? data.email : '';
	data.password = !isEmpty(data.password)? data.password : '';
	data.password2 = !isEmpty(data.password2)? data.password2 : '';


	if(!Validator.isLength(data.name,{min:2, max:30})){
		errors.name ='Name must be between 2 and 30 characters'
	}
	if(!Validator.isLength(data.user_name,{min:2, max:30})){
		errors.user_name ='User Name must be between 2 and 30 characters'
	}
	if(Validator.isEmpty(data.name)){
		errors.name = 'Name Field is required';
	}
	if(Validator.isEmpty(data.user_name)){
		errors.user_name = 'User Name Field is required';
	}
	if(!Validator.isEmail(data.email)){
		errors.email = 'Email is Invalid';
	}
	if(Validator.isEmpty(data.password)){
		errors.password = 'Password Field is required';
	}

	if(!Validator.isLength(data.password,{min:6, max:30})){
		errors.password ='Password must be atleast 5 character'
	}
	if(Validator.isEmpty(data.password2)){
		errors.password2 = 'Confirm Password Field is required';
	}
	if(!Validator.equals(data.password,data.password2)){
		errors.password2 = 'Password must Match';
	}
	return{
		errors,
		isValid: isEmpty(errors)
	}
}