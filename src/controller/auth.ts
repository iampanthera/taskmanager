import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../utils/secrets';

// Route handler for signup
export async function register(req: Request, res: Response) {
  const username = req.body.username;
  const password = req.body.password;

  console.log({ username, password });

  console.log({ User: JSON.stringify(User) });

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log({ existingUser, hashedPassword, username });

    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Generate authentication token using passport
    // const token = await passport.authenticate('local-signup')();

    // Send response with auth token
    res.status(201).json({
      message: 'User created successfully',
      // user,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: 'Error creating user' });
  }
}

// Route handler for login
export async function login(req: Request, res: Response) {
  const username = req.body.username;
  const password = req.body.password;

  console.log({ username, password });

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate authentication token using passport
    // const token = await passport.authenticate('local-login')();

    const token = `Bearer ${jwt.sign({ user }, JWT_SECRET)}`;

    // Send response with auth token
    res.status(200).json({
      message: 'User logged in successfully',
      token,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: 'Error logging in' });
  }
}
