import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GearGame from "@/game/GearGame";
import { Settings, Play } from "lucide-react";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { appState, resetGame } from "@/lib/store";

export default function Home() {
  const { level, score } = useSnapshot(appState);

  useEffect(() => {
    // Load Google AdSense script
    // const script = document.createElement("script");
    // script.src =
    //   "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX";
    // script.async = true;
    // script.crossOrigin = "anonymous";
    // document.head.appendChild(script);
    // Listen for ad show events
    // window.addEventListener("showAd", showAd);
    // return () => window.removeEventListener("showAd", showAd);
  }, []);

  // const showAd = () => {
  //   try {
  //     // Initialize Google Ads
  //     // if (typeof window.adsbygoogle !== 'undefined') {
  //     //   (window.adsbygoogle = window.adsbygoogle || []).push({});
  //     // }
  //   } catch (error) {
  //     console.error("Error showing ad:", error);
  //   }
  // };

  const handleNewGame = () => {
    resetGame();
    window.location.reload(); // Refresh to restart the game
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text">
              Gearheads.io
            </h1>
            <p className="text-muted-foreground">
              Level {level} - Score: {score}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewGame}>
              <Play className="h-4 w-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex gap-2">
            <p className="text-muted-foreground">
              Tap or click to drop gears. <br />
              Connect the gears from left to right. <br />
              Check back every day for a new challenge.
            </p>
          </div>
        </div>
        <Card className="p-4 mb-4 bg-black">
          <GearGame />
        </Card>

        {/* Google Ads Container */}
        <div className="my-4">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXXX"
            data-ad-slot="XXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
}
