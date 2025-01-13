const Header = () => {
  return (
    <div className="bg-gradient-to-tr bg-sky-800 text-slate-200 flex items-center">
      <p className="flex-1 px-4 py-2 text-start text-xl">Memory Card Game</p>
      <div className="px-4 py-2">
        <p>Best Score:</p>
        <p>Current Score:</p>
      </div>
    </div>
  );
};

export default Header;
