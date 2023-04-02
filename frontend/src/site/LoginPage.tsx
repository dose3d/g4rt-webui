import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { SubmitHandler, useForm } from "react-hook-form";
import { useLoginApi } from "../api/auth";

const LoginPage = () => {
  const { loginUser } = useContext(AuthContext);
  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const username = e.target.username.value;
    // @ts-ignore
    const password = e.target.password.value;
    username.length > 0 && loginUser(username, password);
  };*/


  const { register, handleSubmit,onSubmit, formState: { errors }, status, message } = useLoginApi({
    postSubmit: (r) => loginUser(r)
  });

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Login </h1>
        <hr />
        <label htmlFor="username">Username</label>
        <input type="text" id="username" placeholder="Enter Username" {...register("username")} />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="Enter Password" {...register("password")} />
        <button type="submit">Login</button>
      </form>
      <div>Status: {status}</div>
      <div>Message: {message}</div>
    </section>
  );
};

export default LoginPage;
