import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  onClick,
  children,
}) => {
  const baseClasses = "px-6 py-2 geist-light rounded focus:outline-none text-[#131313] transition duration-300 ease-in-out transform hover:scale-105 shadow-md text-sm font-semibold";
  const variantClasses = {
    primary: "bg-[#FB3AA2]  hover:bg-pink-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
