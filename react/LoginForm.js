import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  // State for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
    // Reset form state or handle navigation
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Username and password fields */}
    </form>
  );
}

export default LoginForm;
