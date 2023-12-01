import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import StarRating from "./StarRating";
import {renderIntoDocument} from "react-dom/test-utils";

// function Test(){
//     const [movieRating, setMovieRating] = useState(0)
//     return <div>
//         <StarRating color="black" onSetMovieRating={setMovieRating}/>
//         <p>This movie was rated {movieRating} stars</p>
//     </div>
//
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

