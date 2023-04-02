import React from 'react';

function UserInfo({ user }: {user: {username: string}}) {
  return (
    <div>
      <h1>Hello, {user.username}</h1>
    </div>
  );
}

export default UserInfo;
