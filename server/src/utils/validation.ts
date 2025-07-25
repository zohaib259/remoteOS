// validations/user.validation.ts
import Joi from "joi";

export const signUpValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  otp: Joi.number().integer().positive().required().messages({
    "number.base": "OTP must be a number",
    "number.empty": "OTP is required",
    "any.required": "OTP is required",
  }),
});

export const verifyResendOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});

// Login
export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

//
export const sendResetPasswordOpt = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});

// New password validation
export const newPasswordValidation = Joi.object({
  token: Joi.string().required().messages({
    "string.base": "Token must be a string",
    "string.empty": "Token is required",
    "any.required": "Token is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is Company name",
    "any.required": "Password is required",
  }),
}).required();
export const collabRoomValidation = Joi.object({
  companyName: Joi.string().required().messages({
    "string.base": "Company name must be a string",
    "string.empty": "Company name is required",
  }),

  userName: Joi.string().min(3).required().messages({
    "string.min": "User name must be at least 3 characters",
    "string.empty": "User name is required",
  }),
  userId: Joi.number().required().messages({
    "number.base": "User ID must be a number",
    "number.empty": "User ID is required",
  }),
  teamMembers: Joi.array()
    .items(
      Joi.string().email().messages({
        "string.email": "Each team member must be a valid email",
        "string.empty": "Email cannot be empty",
      })
    )
    .optional()
    .messages({
      "array.base": "Team members must be an array",
    }),
});

// add channel validation
export const addChannelValidation = Joi.object({
  channelName: Joi.string().min(3).max(30).required().messages({
    "string.min": "Channel name must be at least 3 characters",
    "string.max": "Channel name cannot be more than 30 characters",
    "string.empty": "Channel name is required",
    "any.required": "Channel name is required",
  }),
  visibility: Joi.string().valid("public", "teamMembers").required().messages({
    "string.base": "Visibility must be a string",
    "string.empty": "Visibility is required",
    "any.only": "Visibility must be either 'public' or 'teamMembers'",
  }),
  members: Joi.array().min(1).required().messages({
    "array.min": "At least one member is required",
    "array.empty": "Members are required",
    "any.required": "Members are required",
  }),
});
