import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useLoginApi } from '../api/auth';

const LoginPage = () => {
  const { loginUser } = useContext(AuthContext);

  const { register, simpleHandleSubmit, status, errorMessage } = useLoginApi({
    postSubmit: (r) => loginUser(r),
  });

  return (
    <section>
      <form onSubmit={simpleHandleSubmit}>
        <h1>Login </h1>
        <hr />
        <label htmlFor="username">Username</label>
        <input type="text" id="username" placeholder="Enter Username" {...register('username')} />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="Enter Password" {...register('password')} />
        <button type="submit">Login</button>
      </form>
      <div>Status: {status}</div>
      <div>Message: {errorMessage}</div>
    </section>
  );
};

export default LoginPage;
