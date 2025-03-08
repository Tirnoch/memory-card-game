import PropTypes from 'prop-types';

const Card = ({ url, name, handleClick, feedbackStatus }) => {
  // Generate the appropriate CSS classes based on feedback status
  const getFeedbackClass = () => {
    const baseClasses =
      'rounded-xl border-2 relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300';

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
      <p
        className={`text-center font-medium text-xs sm:text-sm md:text-base w-full px-1 truncate ${
          feedbackStatus === 'success'
            ? 'text-green-700'
            : feedbackStatus === 'error'
            ? 'text-red-700'
            : ''
        }`}
      >
        {name}
      </p>
      <img
        src={url}
        alt={`sprite of a ${name}`}
        className="p-2 sm:p-3 md:p-4 h-auto w-auto max-h-[80%] object-contain"
        draggable="false"
      />
    </button>
  );
};

Card.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  feedbackStatus: PropTypes.oneOf(['success', 'error', null]),
};

export default Card;
