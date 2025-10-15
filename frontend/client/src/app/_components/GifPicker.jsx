'use client';
import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

// ✅ No need for `require('dotenv')` on frontend – it's ignored in browser
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIF_API_KEY);

const GifPicker = ({ onGifSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGifs = (offset) => {
    if (searchTerm.trim() === '') {
      return gf.trending({ offset, limit: 5 });
    }
    return gf.search(searchTerm, { offset, limit: 5 });
  };

  return (
    <div className="absolute bottom-20 left-0 z-50 bg-[#1f1f1f] rounded-lg border border-[#444] shadow-lg p-2 w-[250px]">
      <input
        type="text"
        placeholder="Search GIFs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-2 py-1 mb-2 text-sm text-white bg-[#2c2c2c] rounded border border-[#444] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#666]"
      />

      <div className="overflow-y-auto max-h-[300px] ">
        <Grid
          width={430}
          columns={4}
          gutter={6}
          fetchGifs={fetchGifs}
          // ✅ Prevent redirect on click
          onGifClick={(gif, e) => {
            e.preventDefault();         // prevent opening Giphy link
            e.stopPropagation();        // prevent any parent click handling
            onGifSelect(gif.images.original.url); // send only image URL
          }}
        />
      </div>
    </div>
  );
};

export default GifPicker;
