import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios"

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loginInput, setLoginInput] = useState({
    username: '',
    password: '',
  })

  const login = async (inputs) => {
    //TO DO
    const res = await axios.post("http://192.168.1.189:8800/api/auth/login", inputs, {
      withCredentials: true,
    })
    setCurrentUser(res.data)
    return res.data;

  };

  const register = async (inputs) => {
    const res = await axios.post("http://localhost:8800/api/auth/register", inputs);
    // setCurrentUser(res.data);
    return res.data;
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      register,
      loginInput,
      setLoginInput
    }}>
      {children}
    </AuthContext.Provider>
  );
};
