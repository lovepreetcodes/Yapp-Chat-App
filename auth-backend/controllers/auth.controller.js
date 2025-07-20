import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateJwtToken from '../utils/gen-token.js';

const signup = async (req, res) => {
  try {
    const { username, password,  avatar } = req.body;

    // Check if user already exists
    const foundUser = await userModel.findOne({ username });
    if (foundUser) {
      return res.status(409).json({ message: "Account already exists" }); // ✅ use 409 Conflict
    }

    // Hash password and save new user
    const hashedpass = await bcrypt.hash(password, 10);
    const user = new userModel({ username, password: hashedpass,  avatar });
    await user.save();

    generateJwtToken(user._id, res); // ✅ sets cookie only

    return res.status(201).json({ message: "Registration finished" });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const foundUser = await userModel.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({ message: "User does not exist!" }); // ✅ use 404
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" }); // ✅ use 401 for auth error
    }

    generateJwtToken(foundUser._id, res); // ✅ sets cookie

    return res.status(200).json({ message: "Login Successful" });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" }); // ✅ handle unexpected errors
  }
};
export const Logout = ()=>{
 res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: false
  });  res.status(200).json({ message: "Logged out successfully" });
}
export default signup