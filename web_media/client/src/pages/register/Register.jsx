import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import { useContext, useState } from "react";
import axios from "axios"
import { AuthContext } from "../../context/authContext";

const Register = () => {
  const { register } = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  })
  const [email, setEmail] = useState('')

  const navigate = useNavigate()

  const [err, setErr] = useState('')

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const res = await register(inputs);
      alert("Đăng ký tài khoản '" + inputs.username + "' thành công! Xác thực để đăng nhập.");
      navigate('/login');
      setErr('')
      console.log(res);
    } catch (err) {
      console.log(err.response.data)
      setErr(err.response.data)
    }
  }
  return (
    <div className="register">
      <div className="card-register">
        <div className="left">
          <h1>Social Media</h1>
          <p>

          </p>

        </div>
        <div className="right">
          <h1>Đăng ký</h1>
          <form>
            <input type="text" placeholder="Username" name="username" onChange={handleChange} />
            <input type="email" placeholder="Email" name="email" onChange={handleChange} />
            <input type="password" placeholder="Password" name="password" onChange={handleChange} />
            <input type="text" placeholder="Name" name="name" onChange={handleChange} />
            {/* {err && <span>{err}</span>} */}
            <button onClick={handleRegister}>Xác nhận</button>
          </form>
          <div className="login">
            <span>Bạn đã có tài khoản?</span>
            <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
              <button>Đăng nhập</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
