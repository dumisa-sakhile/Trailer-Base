import React from "react";

const TVIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}>
    <path d="M400-376.92 623.08-520 400-663.08v286.16ZM360-160v-80H184.62q-27.62 0-46.12-18.5Q120-277 120-304.62v-430.76q0-27.62 18.5-46.12Q157-800 184.62-800h590.76q27.62 0 46.12 18.5Q840-763 840-735.38v430.76q0 27.62-18.5 46.12Q803-240 775.38-240H600v80H360ZM184.62-280h590.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-430.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H184.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v430.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69ZM160-280v-480 480Z" />
  </svg>
);

const MovieIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}>
    <path d="M740-667.69q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T740-732.31q-13.15 0-22.73 9.58T707.69-700q0 13.15 9.58 22.73t22.73 9.58Zm-160 0q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T580-732.31q-13.15 0-22.73 9.58T547.69-700q0 13.15 9.58 22.73t22.73 9.58Zm-10.77 136h181.54q-3.85-26.54-30.12-43.58T660-592.31q-35.92 0-62.19 17.04-26.27 17.04-28.58 43.58ZM300.18-120q-83.26 0-141.72-58.33Q100-236.67 100-320v-240h400v240q0 83.33-58.28 141.67Q383.44-120 300.18-120Zm-.18-40q66 0 113-47t47-113v-200H140v200q0 66 47 113t113 47Zm360-240q-26.77 0-54.96-7.42-28.19-7.43-46.58-20.73L560-476q21.54 17 46.5 26.5T660-440q66 0 113-47t47-113v-200H500v180h-40v-220h400v240q0 83.33-58.33 141.67Q743.33-400 660-400Zm-440 12.31q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T220-452.31q-13.15 0-22.73 9.58T187.69-420q0 13.15 9.58 22.73t22.73 9.58Zm160 0q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T380-452.31q-13.15 0-22.73 9.58T347.69-420q0 13.15 9.58 22.73t22.73 9.58Zm-80 136q35.92 0 62.19-17.04 26.27-17.04 28.58-43.58H209.23q2.31 26.54 28.58 43.58T300-251.69Zm0-88.31Zm360-280Z" />
  </svg>
);

const LoginIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}>
    <path d="M479.23-160v-40h256.15q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-510.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H479.23v-40h256.15q27.62 0 46.12 18.5Q800-763 800-735.38v510.76q0 27.62-18.5 46.12Q763-160 735.38-160H479.23Zm-28.46-178.46-28.08-28.77L515.46-460H160v-40h355.46l-92.77-92.77 28.08-28.77L592.31-480 450.77-338.46Z" />
  </svg>
);

const LogoutIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill={fill}>
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-56-56 104-104H360v-80h328L584-624l56-56 200 200-200 200Z" />
  </svg>
);

const SearchIcon = ({ fill }: { fill: string }) => (
  <svg
    className="w-5 h-5 absolute left-0 top-1/2 transform -translate-y-1/2"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke={fill}
      strokeLinecap="round"
      strokeWidth="1.5"
      d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
    />
  </svg>
);

const WebsiteIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
    />
  </svg>
);

interface BookmarkIconProps {
  isBookmarked: boolean;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ isBookmarked }) => {
  return (
    <svg
      className="w-6 h-6 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={isBookmarked ? "1.6" : "1"}
        d={
          isBookmarked
            ? "M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
            : "m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
        }
      />
    </svg>
  );
};

const VideoIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"
    />
  </svg>
);

const VoteIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="star"
    className="w-5 h-5"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    style={{ color: "#FFD43B" }}>
    <path
      fill="currentColor"
      d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
    />
  </svg>
);

const RightIcon = () => (
  <svg
    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      d="M9 5l6 7-6 7m6-6"
    />
  </svg>
);

const LeftIcon = () => (
  <svg
    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      d="M15 5l-6 7 6 7m-6-6"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-[#FACC15]"
    fill="currentColor"
    viewBox="0 0 576 512"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
  </svg>
);

const AddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-plus-lg"
    viewBox="0 0 16 16">
    <path
      fillRule="evenodd"
      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-trash3-fill"
    viewBox="0 0 16 16">
    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
  </svg>
);

export {
  TVIcon,
  LoginIcon,
  LogoutIcon,
  MovieIcon,
  SearchIcon,
  WebsiteIcon,
  BookmarkIcon,
  VideoIcon,
  VoteIcon,
  RightIcon,
  LeftIcon,
  StarIcon,
  AddIcon,
  DeleteIcon,
};
