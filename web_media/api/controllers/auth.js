import { db } from "../connect.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pkg from '../utils/email-auth/otp.cjs';
const { generateOTP, sendOTP } = pkg;


export const register = (req, res) => {
    //Check user if exists
    const q = "SELECT * FROM users WHERE username =?"
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length) return res.status(409).json("User already exist!")
        //create acc
        //hash pw
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password, salt)
        const q = "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)"
        const values = [req.body.username, req.body.email, hashedPassword, req.body.name]
        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("User has been created")
        })
    })
}

export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE username=?"
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("User not found!")
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password)
        if (!checkPassword) return res.status(400).json("Wrong password or username!")
        const token = jwt.sign({ id: data[0].id, role: data[0].role }, "secretkey")
        const { password, ...others } = data[0]
        res.cookie("accessToken", token, {
            httpOnly: true,
        }).status(200).json(others)
    })
}

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite: "none"
    }).status(200).json("User has been logged out!")
}

export const otp = async (req, res) => {
    const email = req.body.email;

    try {
        // let user = await User.findOne({ email: email });

        // // If user does not exist, create a new user
        // if (!user) {
        //     user = new User({ email: email });
        // }

        // // If user is blocked, return an error
        // if (user.isBlocked) {
        //     const currentTime = new Date();
        //     if (currentTime < user.blockUntil) {
        //         return res.status(403).send("Account blocked. Try after some time.");
        //     } else {
        //         user.isBlocked = false;
        //         user.OTPAttempts = 0;
        //     }
        // }

        // // Check for minimum 1-minute gap between OTP requests
        // const lastOTPTime = user.OTPCreatedTime;
        // const currentTime = new Date();

        // if (lastOTPTime && currentTime - lastOTPTime < 60000) {
        //     return res
        //         .status(403)
        //         .send("Minimum 1-minute gap required between OTP requests");
        // }

        const OTP = generateOTP();
        // user.OTP = OTP;
        // user.OTPCreatedTime = currentTime;

        // await user.save();

        sendOTP(email, OTP);

        res.status(200).send("OTP sent successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
};

