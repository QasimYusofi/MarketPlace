import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="absolute top-0 left-1/2 h-16 w-32 z-0 font-bold rounded-3xl flex justify-center items-center m-2 bg-amber-100">
        <Link
          href="/auth/user-login/"
          className="absolute text-blue-600 underline"
        >
          Login Page
        </Link>
      </div>
      <div className="text-center bg-blue-300 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
        <p className="text-lg text-white font-bold">
          this is the home page of our Onlie Store Application.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
