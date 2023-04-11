import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/jobs');
  }, [navigate]);

  return <></>;
};

export default HomePage;
