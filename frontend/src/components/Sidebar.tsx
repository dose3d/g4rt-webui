/* eslint-disable tailwindcss/no-contradicting-classname */
import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

interface Props {
  toggle: boolean;
  onToggle: () => void;
}

const Sidebar = ({ toggle, onToggle }: Props) => {
  return (
    <>
      <aside
        className={cn(
          'transition-width fixed left-0 top-0 z-20 flex h-full w-64 shrink-0 flex-col pt-16 duration-75 lg:flex',
          { hidden: !toggle },
        )}
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
            <div className="flex-1 space-y-1 divide-y bg-white px-3">
              <ul className="space-y-2 pb-2">
                <li>
                  <Link
                    to="/jobs/"
                    className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100"
                  >
                    <svg
                      className="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                    </svg>
                    <span className="ml-3">Jobs</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>
      <div className={cn('fixed inset-0 z-10 bg-gray-900 opacity-50', { hidden: !toggle })} onClick={onToggle} />
    </>
  );
};

export default Sidebar;
