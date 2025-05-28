import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  children,
}) => {
  const baseClasses = `
    w-32 h-12 max-sm:w-24 max-sm:h-10
    px-4 py-2 max-sm:px-3 max-sm:py-1.5
    text-sm max-sm:text-xs
    rounded-2xl geist-bold text-[#131313]
    focus:outline-none transition duration-300 ease-in-out
    transform hover:scale-105 hover:rotate-[0.5deg]
    shadow-md
  `;

  const variantClasses = {
    primary: "bg-white hover:bg-gray-200",
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
