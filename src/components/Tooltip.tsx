import React from "react";

const Tooltip = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="relative flex justify-center group">
    {children}
    <span className="absolute bottom-full mb-2 hidden w-max whitespace-nowrap rounded bg-[#1a1919] px-2 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-200 z-10">
      {label}
    </span>
  </div>
);

export default Tooltip;
