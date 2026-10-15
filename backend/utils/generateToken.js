import jwt from "jsonwebtoken";

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export default generateToken;
