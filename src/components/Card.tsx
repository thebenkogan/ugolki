import React, { PropsWithChildren } from "react";

const Card: React.FC<PropsWithChildren<{}>> = (props) => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="rounded overflow-hidden drop-shadow-2xl bg-slate-800 px-10 py-5 flex flex-col justify-center h-auto mx-14">
        {props.children}
      </div>
    </div>
  );
};

export default Card;
