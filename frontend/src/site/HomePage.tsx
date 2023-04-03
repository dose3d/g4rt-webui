import React, { useContext } from 'react';
import UserInfo from '../components/UserInfo';
import AuthContext from '../context/AuthContext';
import { Link } from "react-router-dom";
import { Description, Page, Title } from "../components/layout";

const titleCN =
  'text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  return (
    <Page>
      <Title>List of jobs</Title>
      <Description>List of jobs </Description>
      <form className="mx-auto grid grid-cols-3 gap-8">
        <div className="my-auto">
          Data od: <input type="date" className="border-2" />
        </div>
        <div className="my-auto">
          Data do: <input type="date" className="border-2" />
        </div>
        <div>
          <button className="btn-primary btn-sm  btn">załaduj</button>
        </div>
      </form>
    </Page>
  );
};
/*

    <section>
      {user && <UserInfo user={user} />}
      <h1>You are on home page!</h1>
    </section>
 */
export default HomePage;
