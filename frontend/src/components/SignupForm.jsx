import React from "react";
import { Link } from "react-router-dom";
import { forwardRef,useState } from "react";
import { Eye ,EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
const SignupForm = forwardRef(({handleSubmit, className = 'w-full md:w-1/2'  },refs)=> {
  const {nameRef,emailRef,passwordRef} = refs


  const [showPass,setShowPass] = useState(false);

  const togglePass=()=>{
    setShowPass(!showPass)

  }
  return (
    <div className={className}>
      <form className="px-4 py-6 sm:py-10 w-full flex flex-col items-center"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl sm:text-3xl mb-6 sm:mb-10 font-semibold">
          Create Your Account
        </h1>

        <div className="flex flex-col w-full max-w-sm space-y-4">
          <div>
            <label className="label text-sm font-medium text-gray-400">
              Name
            </label>
            <input
              type="text"
              className="input w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none  focus:border-amber-400"
              placeholder="Full Name"
              ref={nameRef}
              
            />
          </div>

          <div>
            <label className="label text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              className="input w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none  focus:border-amber-400"
              placeholder="Email"
              ref={emailRef}
              
            />
          </div>

          <div>
            <label className="label text-sm font-medium text-gray-400">
              Password
            </label>
            <div className={`w-full border ${useSelector(state=>state.theme.theme)=='dark'?"border-gray-600":"border-gray-300"} rounded-md shadow-sm focus-within:border-amber-400 flex items-center`}>
              <input
                type={showPass ? "text" : "password"}
                className="input w-full  px-3 py-2 border-none rounded-md outline-none shadow-none focus:border-none focus:outline-none"
                placeholder="Password"
                ref={passwordRef}
                
              />
              <div onClick={togglePass} className="px-3 cursor-pointer text-gray-400">
                {showPass ? <Eye /> : <EyeOff />}
              </div>
            </div>
          </div>

          <button
            className="btn bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 rounded-md transition transform hover:scale-105"
          >
            Sign Up
          </button>

          <div className="flex justify-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">Already have an account? &nbsp;</p>
            <Link to="/login" className="text-amber-500 font-medium hover:text-blue-500">
              Login
            </Link>
          </div>

          <button
          type="button"
          onClick={() => window.location.href = "http://localhost:5000/user/google/login"}
          className="btn flex items-center justify-center gap-2 border border-gray-400  py-2 rounded-md transition transform hover:scale-105"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="h-5 w-5"
          />
          <span>Sign in with Google</span>
        </button>
        </div>
      </form>
    </div>
  );
}
)

export default SignupForm;