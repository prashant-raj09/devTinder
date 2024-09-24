const validator = require("validator");
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid Email Address ");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a Strong Password");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];
  /* 
  The code checks whether all the fields in the req.body object are allowed to be edited. If any of the fields in the req.body are not included in the allowedEditFields, the result will be false.
  */
  const isAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isAllowed;
};

const validateEditPassword = (req) => {
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    throw new Error("Please enter a strong Password");
  }
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
  validateEditPassword,
};
