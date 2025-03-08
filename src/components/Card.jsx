const Card = ({ url, name, handleClick, feedbackStatus }) => {
  // Generate the appropriate CSS classes based on feedback status
  const getFeedbackClass = () => {
    const baseClasses =
      'rounded-xl border-2 relative max-[600px]:w-28 transition-all duration-300';

    if (feedbackStatus === 'success') {
      return `${baseClasses} border-green-500 bg-green-100 shadow-lg shadow-green-200`;
    } else if (feedbackStatus === 'error') {
      return `${baseClasses} border-red-500 bg-red-100 shadow-lg shadow-red-200`;
    } else {
      return `${baseClasses} border-stone-600 hover:bg-slate-300 active:bg-slate-200 hover:shadow-md`;
    }
  };

  return (
    <button className={getFeedbackClass()} onClick={handleClick}>
      <img
        src={url}
        alt={`sprite of a ${name}`}
        className="p-4"
        draggable="false"
      />
      <p
        className={`text-center absolute top-0 left-8 max-[600px]:left-4 font-medium ${
          feedbackStatus === 'success'
            ? 'text-green-700'
            : feedbackStatus === 'error'
            ? 'text-red-700'
            : ''
        }`}
      >
        {name}
      </p>
    </button>
  );
};

export default Card;
