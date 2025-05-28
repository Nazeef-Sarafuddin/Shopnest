require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const cookieParser = require("cookie-parser");
const ExtractJwt = require("passport-jwt").ExtractJwt;

const { User } = require("./model/User");
const productsRouters = require("./routes/Products");
const contactRouters = require("./routes/Contacts");
const categoriesRouters = require("./routes/Categories");
const brandsRouters = require("./routes/Brands");
const userRouters = require("./routes/Users");
const authRouters = require("./routes/Auth");
const cartRouters = require("./routes/Carts");
const ordersRouter = require("./routes/Orders");
const { santizeUser, isAuth, cookieExtracter } = require("./services/Common");
const { Order } = require("./model/Order");
const path = require("path");

// Stripe
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);
const endpointSecret = process.env.ENDPOINT_SECRET;

// JWT options
const opts = {
  jwtFromRequest: cookieExtracter,
  secretOrKey: process.env.JWT_SECRET_KEY,
};

const server = express();

// Middlewares
server.use(express.static(path.resolve(__dirname, "build")));
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.authenticate("session"));

server.use(express.json());
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.raw({ type: "application/json" }));

// Passport Local Strategy with bcrypt
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).exec();
      if (!user) {
        return done(null, false, { message: "Invalid Credentials" });
      }

      // Make sure user.password is string
      const storedHash = user.password instanceof Buffer ? user.password.toString() : user.password;

      const isValid = await bcrypt.compare(password, storedHash);
      if (!isValid) {
        return done(null, false, { message: "Invalid Credentials" });
      }

      const token = jwt.sign(santizeUser(user), process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      return done(null, { id: user._id, role: user.role, token });
    } catch (err) {
      return done(err);
    }
  })
);

// Passport JWT Strategy
passport.use(
  "jwt",
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, santizeUser(user));
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// Serialize and deserialize user for session management
passport.serializeUser((user, cb) => {
  process.nextTick(() => cb(null, { id: user.id, role: user.role }));
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => cb(null, user));
});

// Routing
server.use("/products", productsRouters.router);
server.use("/categories", categoriesRouters.router);
server.use("/brands", brandsRouters.router);
server.use("/users", isAuth(), userRouters.router);
server.use("/auth", authRouters.router);
server.use("/cart", isAuth(), cartRouters.router);
server.use("/orders", isAuth(), ordersRouter.router);
server.use("/contacts", contactRouters.router);

server.get("*", (req, res) =>
  res.sendFile(path.resolve("build", "index.html"))
);

// Stripe webhook endpoint
server.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentSucceeded = event.data.object;
      const order = await Order.findById(paymentIntentSucceeded.metadata.order_id);
      if (order) {
        order.paymentStatus = "received";
        await order.save();
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  }
);

// Create payment intent
server.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalAmount, order_id } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { order_id },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Connect to MongoDB and start server
main().catch((err) => console.error(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Database connected");
}

server.listen(process.env.PORT, () => {
  console.log("Server started on port", process.env.PORT);
});
