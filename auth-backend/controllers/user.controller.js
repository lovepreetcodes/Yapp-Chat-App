import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

export const currentUser = async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}