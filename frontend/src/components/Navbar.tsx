import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { CloseIcon, HamburgerIcon } from './icons';

const buttonCN =
  'ml-5 mr-3 hidden items-center rounded-lg bg-cyan-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200 sm:inline-flex';

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
            <button
              aria-expanded="true"
              aria-controls="sidebar"
              className="mr-2 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden"
              onClick={onToggle}
            >
              {toggle ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <Link to="/" className="flex items-center text-xl font-bold lg:ml-2.5">
              <span className="self-center whitespace-nowrap">Dose3D - The Web Interface</span>
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
