/* eslint-disable tailwindcss/no-contradicting-classname */
import React from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import cn from 'classnames';
import { DocumentPlusIcon, PhotoIcon, PresentationChartIcon, RocketLaunchIcon, ServerStackIcon } from './icons';

interface NavLinkProps {
  to: string;
  children?: React.ReactNode;
  label: string;
}

function NavLink({ to, children, label }: NavLinkProps) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link
      to={to}
      className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100"
    >
      {children}
      <span className={cn('ml-3', { 'font-bold': match })}>{label}</span>
    </Link>
  );
}

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
            <div className="flex-1 bg-white px-3">
              <h3 className="pb-2 pt-4 text-base font-bold text-gray-500">Simulation</h3>
              <ul className="space-y-2 pb-2">
                <li>
                  <NavLink to="/jobs/create" label="Define">
                    <DocumentPlusIcon />
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/jobs/" label="Run">
                    <RocketLaunchIcon />
                  </NavLink>
                </li>
              </ul>

              <h3 className="pb-2 pt-4 text-base font-bold text-gray-500">Analysis</h3>
              <ul className="space-y-2 pb-2">
                <li>
                  <NavLink to="/load" label="Load data">
                    <ServerStackIcon />
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/draw/2d" label="Draw dose 2D">
                    <PhotoIcon />
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/draw/profiles" label="Draw dose profiles">
                    <PresentationChartIcon />
                  </NavLink>
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
