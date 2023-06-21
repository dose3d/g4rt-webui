import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from './icons';

export interface Breadcrumb {
  icon?: React.ReactNode;
  label: React.ReactNode;
  to: string;
}

interface Props {
  breadcrumbs: Breadcrumb[];
}

export const BreadcrumbsIconClass = 'h-4 w-4 mr-1';

const Breadcrumbs = ({ breadcrumbs }: Props) => {
  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link to="/">
            <HomeIcon className={BreadcrumbsIconClass} />
            Home
          </Link>
        </li>
        {breadcrumbs.map((o, i) => (
          <li key={i}>
            <Link to={o.to}>
              {o.icon}
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
