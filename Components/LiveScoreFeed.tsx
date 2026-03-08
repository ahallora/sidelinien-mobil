export default function LiveScoreFeed() {
  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Live Score</h2>
      </div>
      <div className="flex-1 overflow-hidden relative bg-muted/20">
        {/* We use a generic Sofascore events widget for FC Copenhagen (team 1063) */}
        {/* If the team widget doesn't load dynamically, it falls back to a clean list styling provided by Sofascore */}
        <iframe
          src="https://m.flashscore.dk/?s=2"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="yes"
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Live Score"
        ></iframe>
      </div>
    </div>
  );
}
