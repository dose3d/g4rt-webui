import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { CloseIcon, HamburgerIcon } from './icons';

const buttonCN = 'btn btn-ghost';

const menuButtonCN =
  // eslint-disable-next-line max-len
  'mr-2 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden';

interface Props {
  toggle: boolean;
  onToggle: () => void;
}

const Navbar = ({ toggle, onToggle }: Props) => {
  const { user, logoutUser } = useContext(AuthContext);
  return (
    <nav className="fixed z-30 w-full border-b border-gray-200 bg-white">
      <div className="p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button aria-expanded="true" aria-controls="sidebar" className={menuButtonCN} onClick={onToggle}>
              {toggle ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <Link to="/" className="flex items-center text-xl font-bold lg:ml-2.5">
              <img src="/favicon.ico" className="mr-2 h-12" alt="geant4-rt logo" />
              <span className="self-center whitespace-nowrap">geant4-rt</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <button onClick={logoutUser} className={buttonCN}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonCN}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
