const Card = ({ url, name, handleClick }) => {
  return (
    <button
      className="rounded-xl border-stone-600 border-2 hover:bg-slate-300 active:bg-slate-200 relative"
      onClick={handleClick}
    >
      <img src={url} alt={`sprite of a ${name}`} className="p-4" />
      <p className="text-center absolute top-0 left-8">{name}</p>
    </button>
  );
};

export default Card;
