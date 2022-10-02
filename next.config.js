module.exports = {
  async redirects() {
    return [
      {
        source: "/showthread.php",
        destination: "https://sidelinien.dk/forums/showthread.php",
        permanent: true,
      },
    ];
  },
};
