import React from 'react';
// import Link from 'next/link';

import UpdateItem from '../components/UpdateItem';

const Home = ({ query }) => (
  <div>
    <UpdateItem id={query.id} />
  </div>
);

export default Home;
