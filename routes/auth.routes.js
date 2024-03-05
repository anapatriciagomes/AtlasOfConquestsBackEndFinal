const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Visited = require('../models/Visited.model.js');
const Wishlist = require('../models/Wishlist.model.js');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const saltRounds = 10;

router.post('/signup', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (email === '' || password === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Provide valid email address' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: 'The provided email is already registered' });
    }

    const salt = bcrypt.genSaltSync(saltRounds);

    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.json({ email: newUser.email, _id: newUser._id });
  } catch (error) {
    console.log('Error creating the user', error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (email === '' || password === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email })
      .populate('visited')
      .populate('wishlist');

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Provided email is not registered' });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      const payload = {
        _id: user._id,
        email: user.email,
        visited: user.visited,
        wishlist: user.wishlist,
      };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: '6h',
      });

      res
        .status(200)
        .json({ authToken, userId: payload._id, email: payload.email });
    } else {
      return res.status(401).json({ message: 'Unable to authenticate user' });
    }
  } catch (error) {
    console.log('An error occurred login in the user', error);
    next(error);
  }
});

router.get('/verify', isAuthenticated, (req, res, next) => {
  console.log('req.payload', req.payload);

  res.json(req.payload);
});

router.get('/users/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const user = await User.findById(userId)
      .populate('visited')
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({ message: 'No user was found' });
    }

    const { email, _id, visited, wishlist } = user;

    const responseData = { email, _id, visited, wishlist };

    res.json(responseData);
  } catch (error) {
    console.log('Error fetching user', error);
    next(error);
  }
});

router.put('/users/:userId', async (req, res, next) => {
  const { email, password } = req.body;
  const { userId } = req.params;

  try {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',
      });
    }

    const salt = bcrypt.genSaltSync(saltRounds);

    const hashedPassword = bcrypt.hashSync(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email,
        password: hashedPassword,
      },
      { new: true }
    );

    console.log('Updated User', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.log('Error changing password', error);
    next(error);
  }
});

router.delete('/users/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    await Visited.deleteMany({ userId });
    await Wishlist.deleteMany({ userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User account deleted' });
  } catch (error) {
    console.log('Error deleting user account', error);
    next(error);
  }
});

router.put('/forgot-password', async (req, res, next) => {
  if (process.env.GOOGLE_APP_EMAIL && process.env.GOOGLE_APP_PW) {
    const email = req.body.email;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ error: 'User with this email does not exist' });
      }

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: '30m',
      });

      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GOOGLE_APP_EMAIL,
          pass: process.env.GOOGLE_APP_PW,
        },
      });

      const data = {
        from: {
          name: 'Atlas Of Conquests',
          address: process.env.GOOGLE_APP_EMAIL,
        },
        to: email,
        subject: 'Reset Account Password Link',
        html: `
        <h3>Please click the link below to reset your password</h3>
        <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
        `,
      };

      await user.updateOne({ resetLink: token });

      await transporter.sendMail(data);

      return res.status(200).json({
        message:
          'Please check your email inbox and spam, you will receive a reset link in the next few minutes',
      });
    } catch (error) {
      next(error);
      return res.status(400).json({ error: 'Reset password link error' });
    }
  } else {
    return res.status(400).json({
      error:
        'You have not set up an account to send an email or a reset password key for jwt',
    });
  }
});

router.put('/reset-password', async (req, res, next) => {
  const { token, password } = req.body;
  console.log('Received Token:', token);
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({ resetLink: token });

    if (!user || !decodedToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',
      });
    }

    const salt = bcrypt.genSaltSync(saltRounds);

    const hashedPassword = bcrypt.hashSync(password, salt);

    user.password = hashedPassword;
    user.resetLink = undefined;
    await user.save();

    return res.status(200).json({ message: 'Your password has been changed' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Reset Password Error' });
  }
});

module.exports = router;
