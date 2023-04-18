import React, { useEffect, useState } from 'react';
import { useSimpleJwtAxios } from '../drf-crud-client';

function ProtectedPage() {
  const [res, setRes] = useState('');
  const api = useSimpleJwtAxios();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/test/');
        setRes(response.data.response);
      } catch {
        setRes('Something went wrong');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Projected Page</h1>
      <p>{res}</p>
    </div>
  );
}

export default ProtectedPage;
