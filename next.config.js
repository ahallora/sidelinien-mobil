module.exports = {
  async redirects() {
    return [
      {
        source: "/showthread.php",
        destination: "http://sidelinien.dk/forums/showthread.php",
        permanent: true,
      },
    ];
  },
};
