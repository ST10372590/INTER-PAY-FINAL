import React from 'react'
import { Helmet } from 'react-helmet-async'
import LoginForm from '../components/Forms/LoginForm'

// (React Documentation, 2024)
const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login - International Payments Portal</title>
        <meta
          name="description"
          content="Login to your international payments account"
        />
      </Helmet>
      <LoginForm />
    </>
  )
}

export default Login

/*
----------------------------------
Reference List
----------------------------------

React Documentation. 2024. React – A JavaScript library for building user interfaces. [online]. Available at: https://react.dev [5 October 2025]

*/