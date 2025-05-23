import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type ?: "button" | "submit" | "reset";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  children,
}) => {
  const baseClasses = "px-8 py-4 geist-bold rounded focus:outline-none text-[#131313] transition duration-300 ease-in-out transform hover:scale-105 shadow-md text-sm font-semibold";
  const variantClasses = {
    primary: "bg-white  hover:bg-gray-200",
    ghost:
      "bg-transparent text-white hover:bg-[#131313] shadow-lg ring-1 ring-white/20",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      type={type}
      disabled={disabled}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
