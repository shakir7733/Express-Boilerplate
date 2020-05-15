const Sequelize = require("sequelize");
const {none} = require('../../helpers/getAccess')

const UserModel = {
    user_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "This user name is taken please choose another one"
        },
        validate: {
            notNull: {
                msg: "Please enter your User"
            }
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Please enter your name"
            }
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "Email address already in use!"
        },
        validate: {
            isEmail: true
        }
    },
    // phone: {
    //     type: Sequelize.BIGINT,
    //     allowNull: true
    //     // validate: {
    //     //     len: [10],
    //     //     customValidator(value) {
    //     //       if (value === null && this.phone.length <= 10) {
    //     //         throw new Error("Phone number must have 10 digits ");
    //     //       }
    //     //     }
    //     //   }
    // },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM('god', 'admin','user'),
        defaultValue:'god'
    },
    photo: {
        type: Sequelize.STRING
    },
    resetpasswordtoken :{
        type:Sequelize.STRING,
    },
    resetpasswordexpires :{
        type:Sequelize.DATE,
    },
    access:{
        type:Sequelize.JSON,
        // defaultValue:none()
    }
};

module.exports = UserModel;
