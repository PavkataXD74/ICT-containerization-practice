require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Recipe = require("./models/recipe");

const dbURI = process.env.DB_URI;
const port = process.env.PORT || 5000;

const app = express();

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		app.listen(port);
		console.log(`Listening on port ${port}`);
	})
	.catch(error => console.log(error));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (_, res) => {
	Recipe.find()
		.then(recipes =>
			res.render("pages/index", {
				title: "Рецепти",
				stylesheet: "./css/style.css",
				recipes,
			})
		)
		.catch(error => console.log(error));
});

app.post("/new-recipe", (req, res) => {
	let recipe = new Recipe({
		name: req.body.name,
		body: req.body.body,
	});

	recipe
		.save()
		.then(() => res.redirect("/"))
		.catch(error => console.log(error));
});

app.get("/add-recipe", (_, res) => {
	res.render("pages/add_recipe", {
		title: "Добави Нова Рецепта",
		stylesheet: "./css/style.css",
	});
});

app.get("/edit-recipe/:id", (req, res) => {
	Recipe.findOne({ _id: req.params.id })
		.then(result =>
			res.render("pages/edit_recipe", {
				title: "Промени Рецепта",
				stylesheet: "../css/style.css",
				recipe: result,
			})
		)
		.catch(error => console.log(error));
});

app.get("/recipes/:id", (req, res) => {
	Recipe.find({ _id: req.params.id })
		.then(result =>
			res.render("pages/inspect_recipe", {
				stylesheet: "../css/style.css",
				recipe: result[0],
			})
		)
		.catch(error =>
			res.render("pages/database_error", {
				title: "Грешка в базата данни",
				stylesheet: "../css/style.css",
				error: error,
			})
		);
});

app.get("/delete/:id", (req, res) => {
	Recipe.deleteOne({ _id: req.params.id })
		.then(() => res.redirect("/"))
		.catch(error =>
			res.render("pages/database_error", {
				title: "Грешка в базата данни",
				stylesheet: "../css/style.css",
				error: error,
			})
		);
});

app.post("/edit/:id", (req, res) => {
	Recipe.updateOne(
		{ _id: req.params.id },
		{ name: req.body.name, body: req.body.body }
	)
		.then(_ => {
			res.redirect("/");
		})
		.catch(error => console.log(error));
});

app.get("/recipes", (_, res) => {
	res.redirect("/");
});

app.get("/*", (_, res) => {
	res.render("pages/routing_error", {
		title: "Грешка при намиране",
		stylesheet: "../css/style.css",
	});
});
