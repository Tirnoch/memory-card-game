import { useEffect, useState, useRef } from 'react';
import Header from './components/Header';
import CardContainer from './components/CardContainer';

export default function App() {
  // fetches the first 9 results from the API at first render
  // useEffect(() => {
  //   fetchAPI().then((result) => {
  //     setRandomArray(result.splice(0, 9));
  //   });
  // }, []);
  // console.log(randomArray);
  // will be re-evaluated after the API connection establishes

  return (
    <>
      <Header />
      <CardContainer />
    </>
  );
}
