const express = require("express");
const cors = require("cors");
const path = require("path");
const colors = require('colors');
const bodyParser = require("body-parser");
const passport = require("passport");
var expressHandlebars = require("express-handlebars");
const {mailerSetup} =require('./utils/sendEmail')
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const dotenv = require('dotenv');

const swaggerOptions=require('./utils/swaggerOptions');
const errorHandler = require('./helpers/error')

const users = require("./routes/api/v1/users");

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

app.use(cors());

app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set security headers
app.use(helmet());

//Passport middleware
app.use(passport.initialize());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

//Sendig Mail
mailerSetup(app)

// Passport Config
require("./config/passport")(passport);

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Use Routes
app.use("/api/v1/users", users);

app.use(errorHandler);

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
	// Set static folder
	app.use(express.static("admin/build"));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "admin", "build", "index.html"));
	});
}
const port = process.env.PORT || 4000;

app.listen(
	port,
	console.log(
	  `Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold
	)
);