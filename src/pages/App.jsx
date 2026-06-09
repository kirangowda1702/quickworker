import { useState } from "react"

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"

import { auth } from "../firebase/config"

function Auth() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const googleProvider = new GoogleAuthProvider()

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      if (isRegister) {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

        alert("Registration Successful 🔥")

      } else {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        alert("Login Successful 🔥")
      }

    } catch (error) {

      alert(error.message)
    }
  }

  const handleGoogleLogin = async () => {

    try {

      await signInWithPopup(auth, googleProvider)

      alert("Google Login Successful 🔥")

    } catch (error) {

      alert(error.message)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-5">

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-blue-600">

          {isRegister ? "Register" : "Login"}

        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">

          Welcome to QuickWorker

        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full border p-4 rounded-xl mb-5"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full border p-4 rounded-xl mb-5"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition"
          >

            {isRegister ? "Register" : "Login"}

          </button>

        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-5 border py-4 rounded-xl hover:bg-gray-100 transition"
        >

          Continue with Google

        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          className="text-center mt-6 text-blue-600 cursor-pointer"
        >

          {isRegister
            ? "Already have account? Login"
            : "Create New Account"}

        </p>

      </div>

    </div>
  )
}

export default Auth