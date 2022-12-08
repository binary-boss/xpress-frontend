import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiExecuted, setApiExecuted] = useState(false)

  const history = useHistory();

  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   */
  const login = async (formData) => {
    const isValidated = validateInput(formData)
    if (isValidated) {
      setApiExecuted(true)
      try {
        const response = await axios.post(`${config.endpoint}/auth/login`, formData)
        const { token, username, balance } = response.data;
        persistLogin(token, username, balance)
        enqueueSnackbar("Logged in successfully", { variant: 'success', autoHideDuration: 3000 })
        history.push("/", { from: "Login" })
      } catch (err) {
        if (err.response.status === 400) {
            enqueueSnackbar(err.response.data.message, { variant: 'error',autoHideDuration: 3000 })
          }
          else
            enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.",{ variant: 'error',autoHideDuration: 3000 })
      }
    }
    setApiExecuted(false)
  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   */
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: 'warning', autoHideDuration: 3000 });
      return false;
    } else if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: 'warning', autoHideDuration: 3000 })
      return false;
    }
    return true;
  };

  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("username", username)
    localStorage.setItem("token", token)
    localStorage.setItem("balance", balance)
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={(e)=>setUsername(e.target.value)}
          />
          <TextField
            id="password"
            variant="outlined"
            label="password"
            title="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={(e)=>setPassword(e.target.value)}
          />
          {(apiExecuted === true) ?
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress color="success" />
            </Box>
            :
            <Button className="button" name="register" variant="contained"
              onClick={() => login({ username: username, password: password })}
            >
              LOGIN TO XPRESS
            </Button>
          }
           <p className="secondary-action">
            Don’t have an account?{" "}
             <Link to ="/register" className="link" >
              Register Now
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
