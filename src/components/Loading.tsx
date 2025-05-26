const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center py-6 min-h-[10rem] bg-black transition-colors">
      {/* Custom Tailwind CSS Spinner */}
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
};

export default Loading;
