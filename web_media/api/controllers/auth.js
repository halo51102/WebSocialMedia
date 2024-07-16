import { db } from "../connect.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateOTP, sendVerifyEmail } from "../utils/email-auth/verify.js";
import cryto from 'crypto'
import validator from "validator";
import fs from "fs"


const createToken = (_id) => {
    const jwtSecretKey = 'secretKey';

    return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });
};

export const register = (req, res) => {
    const { username, email, password, name } = req.body;

    //Check user if exists
    const q = "SELECT * FROM users WHERE username =?"
    db.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length) return res.status(409).json("User already exist!")

        //validate
        if (!username || !email || !password || !name)
            return res.status(400).json("Không được để trống các trường...");

        if (!validator.isEmail(email))
            return res.status(400).json("Điền đúng định dạng một email...");

        if (!validator.isStrongPassword(password))
            return res.status(400).json("Mật khẩu chưa đủ mạnh...");

        //hash pw
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password, salt)
        const emailToken = cryto.randomBytes(64).toString('hex');
        const q = "INSERT INTO users (`username`,`email`,`password`,`name`,`emailToken`) VALUE (?)"
        const values = [req.body.username, req.body.email, hashedPassword, req.body.name, emailToken]
        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err);
            sendVerifyEmail(email, emailToken);
            db.query("select * from users where username = ?",
                [username],
                (err, data) => {
                    if (err) return res.status(500).json(err);
                    const { password, ...others } = data[0];
                    return res.status(200).json(others);
                }
            );
        })
    })
}

export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE username=?"
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("Không tồn tại user trong hệ thống.")
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password)
        if (!checkPassword) return res.status(400).json("Sai tên tài khoản hoặc mật khẩu");
        if (data[0].isVerified == 'false') {
            return res.status(400).json("Tài khoản chưa được xác thực. Vui lòng kiểm tra email đã được đăng ký để xác thực tài khoản");
        }
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

export const verifyEmail = async (req, res) => {
    try {
        const emailToken = req.body.emailToken;
        if (!emailToken) return res.status(404).json("EmailToken not found...");
        const q = "SELECT * FROM users WHERE emailToken =?"
        db.query(q, [emailToken], (err, data) => {
            if (err) return res.status(500).json(err)
            console.log(data)
            if (data.length) {
                const user = data[0];
                const userId = user.id;
                const query = "update users set emailToken = null, isVerified = true where id = ?"
                db.query(query, [userId], (err, data) => {
                    if (err) return res.status(500).json(err)
                    if (data.affectedRows == 0) return res.status(400).json("Xác thực chưa thành công.")
                    db.query("select * from users where username = ?", [user.username], (err, data) => {
                        if (err) return res.status(500).json(err)
                        const { password, ...others } = data[0]
                        return res.status(200).json({
                            msg: "Xác thực thành công.",
                            data: others,
                        });
                    });
                });

                // const token = jwt.sign({ id: user.id, role: user.role }, "secretkey")
                // return res.status(200).json({
                //     _id: user._id,
                //     name: user.name,
                //     email: user.email,
                //     token,
                //     isVerified: user?.isVerified,
                // });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    };
}

export const sendEmail = async (req, res) => {
    const { email, emailToken } = req.body;
    sendVerifyEmail(email, emailToken);
}

export const authorize = (req, res)=>{
    const q = "SELECT * FROM users WHERE username=?"
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("Không tồn tại user trong hệ thống.")
        // const checkPassword = bcrypt.compareSync(req.body.password, data[0].password)
        // if (!checkPassword) return res.status(400).json("Sai tên tài khoản hoặc mật khẩu");
        // if (data[0].isVerified == 'false') {
        //     return res.status(400).json("Tài khoản chưa được xác thực. Vui lòng kiểm tra email đã được đăng ký để xác thực tài khoản");
        // }
        const token = jwt.sign({ id: data[0].id, role: data[0].role }, "secretkey")
        const { password, ...others } = data[0]
        res.cookie("accessToken", token, {
            httpOnly: true,
        }).status(200).json(others)
    }) 
}

const log=()=>{

}