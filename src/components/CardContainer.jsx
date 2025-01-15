import { useEffect, useState, useRef } from 'react';
import URL_ARRAY from './URL_ARRAY';

function shuffle(arr) {
  let newArr = arr;
  let currentIndex = arr.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArr[currentIndex], newArr[randomIndex]] = [
      newArr[randomIndex],
      newArr[currentIndex],
    ];
  }
  return newArr;
}

const CardContainer = () => {
  const [randomArray, setRandomArray] = useState(URL_ARRAY);

  const handleClick = (e) => {
    let pokeIndex = e.target.id;
    setRandomArray((prevArr) => {
      const updatedArray = [...prevArr];
      updatedArray[pokeIndex].clicked = true;
      shuffle(updatedArray);
      return updatedArray;
    });
    console.log(
      [...randomArray].map(
        (index) => `${index.key} ${index.name} ${index.clicked}`
      ),
      `clicked elements id:  ${e.target.id}`
    );
  };

  return (
    <ul className="grid grid-rows-3 grid-cols-3">
      {randomArray.map(({ name, key, clicked, url }) => {
        return (
          <li key={key} className="">
            <button
              className="rounded-xl border-stone-600 border-2 hover:bg-slate-300 active:bg-slate-200 relative"
              onClick={handleClick}
            >
              <img
                src={url}
                alt={`sprite of a ${name}`}
                className="p-4"
                id={key}
              />
              <p className="text-center absolute top-0 left-8">{name}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default CardContainer;
