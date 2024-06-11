import "./verify-email.scss"
import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/authContext"
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
    const { loginInput, setLoginInput, login } = useContext(AuthContext)
    const [user, setUser] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const emailToken = searchParams.get('emailToken');

    useEffect(() => {
        const fetch = async () => {
            if (user?.isVerified === 'true') {
                setTimeout(async () => {
                    try {
                        console.log(loginInput)
                        const userData = await login(loginInput);
                        setLoginInput({ username: '', password: '' });
                        if (userData.role === "admin") {
                            navigate("/admin");
                        }
                        else {
                            navigate("/")
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }, 2000);
            } else {
                try {
                    const res = await axios.post("http://localhost:8800/api/auth/verify-email", { emailToken });
                    setUser(res.data.data);
                }
                catch (err) {
                    console.log(err)
                }
            }
        };
        fetch();
    }, [user]);

    const handleSendEmail = async () => {
        const email = user.email;
        const emailToken = user.emailToken;
        console.log(emailToken)
        await axios.post("http://localhost:8800/api/auth/send-verify-email", { email, emailToken });
    }

    return (
        <div>
            {user?.isVerified === 'true' ?
                <div className="container-verify-email">
                    <span>Xác thực tài khoản thành công! Đăng nhập để trải nghiệm.</span>
                    {/* <caption>Đang chuyển hướng...</caption> */}
                </div> :
                <div className="container-verify-email">
                    <span>Email đã được xác thực.</span>
                    {/* <button onClick={handleSendEmail}> Gửi lại Email</button> */}
                </div>
            }
        </div>
    )
}

export default VerifyEmail;