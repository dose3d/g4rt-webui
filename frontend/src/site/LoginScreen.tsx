import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useLoginApi } from '../api/auth';
import { CTextInput } from '../components/forms';
import { ErrorAlert } from '../components/layout';

function LoginScreen() {
  const { loginUser } = useContext(AuthContext);

  const { control, simpleHandleSubmit, isLoading, errorMessage } = useLoginApi({
    postSubmit: (r) => loginUser(r),
    formProps: { defaultValues: { username: 'admin', password: 'admin' }, reValidateMode: 'onSubmit' },
  });

  return (
    <div className="pt:mt-0 mx-auto flex flex-col items-center justify-center px-6 pt-8 md:h-screen">
      <div className="w-full rounded-lg bg-white shadow sm:max-w-screen-sm md:mt-0 xl:p-0">
        <div className="space-y-8 p-6 sm:p-8 lg:p-16">
          <img src="/favicon.ico" className="mx-auto" alt="Windster Logo" />
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Sign in to geant4-rt</h2>
          <form className="mt-8" onSubmit={simpleHandleSubmit}>
            <CTextInput name="username" control={control} title="Your login (please type: admin)" />
            <CTextInput name="password" type="password" control={control} title="Your password (please type: admin)" />
            <button type="submit" className="btn-primary btn" disabled={isLoading}>
              Login
            </button>
          </form>
          {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
