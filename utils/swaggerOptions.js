//Swagger API Documentation
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: "Bloirplate API",
			description: "ExpressJs Boilerplate Api",
			contact: {
				name: "Shakir Dev"
			},
			servers: ["http://localhost:4000"]
		}
	},
	// ['.routes/*.js']
	apis: ["./routes/api/v1/*.js"]
};

module.exports = swaggerOptions