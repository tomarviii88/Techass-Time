const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcyrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const randomsting = require('randomstring');
const nodemailer = require('nodemailer');
//@route /api/users/
//@desc Post route to register a user
//@access Public

router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password should be minimum of length of 6').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //See if the user exist
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exsist' }] });
      }

      const verify = randomsting.generate(7);

      const users = new User({
        name,
        email,
        password,
        verify
      });

      //Encrypt the password
      const salt = await bcyrpt.genSalt(10);
      users.password = await bcyrpt.hash(password, salt);
      await users.save();

      var transport = {
        host: 'smtp.gmail.com',
        auth: {
          user: 'ritikatomar2811@gmail.com',
          pass: 'Ritika01#'
        }
      };

      var transporter = nodemailer.createTransport(transport);

      transporter.verify((error, success) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Server is ready to take messages');
        }
      });

      const mail = {
        from: 'ritikatomar2811@gmail.com',
        to: users.email,
        subject: 'Quiz: Verify your Account',
        html: `<p>Hello ${users.name},</p><p>Your Verification String: <b>${users.verify}</b></p>`
      };

      transporter.sendMail(mail, (err, data) => {
        if (err) {
          res.json({ msg: 'fail' });
        } else {
          res.json({ msg: 'success' });
        }
      });

      res.json({ msg: 'Verification link has been send to you mail' });
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/verify-email',
  [
    check('email', 'Email is required')
      .not()
      .isEmpty()
      .isEmail(),
    check('verify', 'Verification String is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Create Account First' }] });
      }
      if (user.active === true) {
        return res.status(400).json({ errors: [{ msg: 'Already verified' }] });
      }
      if (user.verify === req.body.verify) {
        user = await User.findOneAndUpdate(
          { email: req.body.email },
          { $set: { active: true } },
          { new: true }
        );
        return res.json({ msg: 'Account Verified Successfully' });
      } else {
        return res.status(400).json({ errors: [{ msg: 'Invalid Token' }] });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);
module.exports = router;
