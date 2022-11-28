const express = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const router = express.Router();
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const Joi = require("joi");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental)
    return res.status(404).send("no rental forun for this customer/movie");

  if (rental.dateReturned)
    return res.status(400).send("rental already processed");

  rental.return();
  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectid().required(),
    movieId: Joi.objectid().required(),
  };
}
module.exports = router;
