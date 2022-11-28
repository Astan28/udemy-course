const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Fawn = require("fawn");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const auth = require("../middleware/auth");
Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort(-dateOut);
  res.send(rentals);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("movie with given id does not exist");

  const customer = await Customer.findById(req.body.customerId);

  if (!customer)
    return res.status(404).send("customer with given id does not exist");

  if (movie.numberInStock === 0)
    return res.status(400).send("movie is not in stock");

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();
    res.send(rental);
  } catch (ex) {
    res.status(500).send("something failed.");
  }
});

module.exports = router;
