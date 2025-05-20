import { Link } from "@tanstack/react-router";
import LinkTo from "./LinkTo";

const NotFound = () => {
  return (
    <>
      <title>Trailer Base - 404</title>
      <div className="w-full h-full flex flex-col gap-5 py-4  min-h-10 items-center justify-center">
        <h1 className="text-5xl text-left geist-bold ">404</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
         Oh no! You got lost on the way to Trailer Base.
          
        </p>
        <LinkTo url="/" variant="ghost" >Go Home</LinkTo>
        
      </div>
    </>
  );
}

export default NotFound