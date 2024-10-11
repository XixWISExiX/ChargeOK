
import React from 'react';
import Hero from './Hero';
import Map from '../GoogleMap'
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './Navbar';
import './styling/index.css'

export default function Layout()  {
  return (
    

    <body>
        <div>
    <TopNavbar></TopNavbar>
    <Hero></Hero>
     </div>
    </body>

  );
};


