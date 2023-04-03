import React from 'react';
import { useParams } from 'react-router-dom';

export default function JobDetailPage() {
  const { jobId } = useParams();

  return <div>Job detail: {jobId}</div>;
}
