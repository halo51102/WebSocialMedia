import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.scss";

function Login() {
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    })

    const [err, setErr] = useState(null)

    const navigate = useNavigate()

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            await login(inputs);
            navigate("/")
        } catch (err) {
            setErr(err.response.data)
        }
    };

    return (
        <div className="login">
            <div className="card">
                <div className="left">
                    <h1>Xin chào</h1>
                    <p>

                    </p>
                </div>
                <div className="right">
                    <h1>Đăng nhập</h1>
                    <form>
                        <input type="text" placeholder="Username" name="username" onChange={handleChange} />
                        <input type="password" placeholder="Password" name="password" onChange={handleChange} />
                        {err && err}
                        <button onClick={handleLogin}>Enter</button>
                    </form>
                    <div className="register">
                        <span>Bạn chưa có tài khoản?</span>
                        <Link to="/register"
                            style={{ textDecoration: "none", color: "inherit" }} >
                            <button>Đăng ký</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
