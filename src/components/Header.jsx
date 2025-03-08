const Header = ({ highScore, currentScore }) => {
  return (
    <div className="bg-gradient-to-tr from-sky-700 to-sky-900 text-slate-200 flex flex-col sm:flex-row items-center p-3 sm:p-4 shadow-md">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold sm:flex-1 mb-2 sm:mb-0">
        Memory Card Game
      </h1>
      <div className="flex gap-4 sm:gap-6 text-sm sm:text-base px-2 py-1 sm:px-4 bg-sky-950/30 rounded-lg">
        <p className="font-medium">
          Best: <span className="font-bold">{highScore}</span>
        </p>
        <p className="font-medium">
          Current: <span className="font-bold">{currentScore}</span>
        </p>
      </div>
    </div>
  );
};

export default Header;
