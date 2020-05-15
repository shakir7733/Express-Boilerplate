const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const UserModel = require('./Model/UserModel');
const keys = require('../config/keys')
const dotenv = require('dotenv');
const {all} = require('../helpers/getAccess');

dotenv.config({ path: '../config/config.env' });

let Conn;
Conn = new Sequelize(
  keys.DB_NAME,
  keys.DB_USER,
  keys.DB_PASSWORD,
  {
      dialect:keys.DB_TYPE,
      host:keys.DB_HOST
  }
);

const User = Conn.define('user',UserModel, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }    
});

//Relationship

// console.log(all())
// Conn.sync({force:true})
// .then(()=>{
//         return User.create({
//             id:1,
//             user_name:'shakir7',
//             name:'Shakir Khan',
//             email:'samshake7@gmail.com',
//             password:'shakir',
//             phone:9124465455,
//             role:"god",
//             photo:'',
//             access:all()
//         });
// }).catch(err=>console.log({err}));

// Conn.sync()
//     .then(() => console.log('Tables Created'))
//     .catch(error => console.log('This error occured', error));

module.exports = Conn;