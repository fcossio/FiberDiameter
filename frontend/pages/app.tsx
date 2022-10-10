import React from "react";
import dynamic from "next/dynamic";
const App = dynamic(import('../components/App'), { ssr: false });

const AppPage = () => {
  return (
    <div className='container w-4/5 p-4 mx-auto'>
      <App />
    </div>
  );
};

export default AppPage;
