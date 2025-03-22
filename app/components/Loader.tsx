const Loader = () => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 py-12">
      <div className="w-4 h-4 rounded-full bg-[#2f006c] animate-bounce"></div>
      <div className="w-4 h-4 rounded-full bg-[#2f006c] animate-bounce [animation-delay:-.3s]"></div>
      <div className="w-4 h-4 rounded-full bg-[#2f006c] animate-bounce [animation-delay:-.5s]"></div>
    </div>
  );
};

export default Loader;
