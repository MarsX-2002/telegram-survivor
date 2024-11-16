module.exports = {
  rewrites: [
    {
      source: '/:path*',
      destination: '/:path*',
    },
  ],
  headers: [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
};
