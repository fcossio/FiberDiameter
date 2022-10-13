import React from "react";
import dynamic from "next/dynamic";
const App = dynamic(import('../components/App'), { ssr: false });

const AppPage = () => {
  return (
    <div className='h-screen mx-auto bg-black lg:w-4/5 '>
      <App />
    </div>
  );
};

export default AppPage;
