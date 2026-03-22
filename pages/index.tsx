import Head from "next/head";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import Login from "../Components/Login";
import BlueskyFeed from "../Components/BlueskyFeed";
import { Sidebar } from "@/Components/Sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function Index() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getMobileTitle = () => {
    switch (activeTab) {
      case "chat":
        return "Nice FC";
      case "fcklive":
        return "#fcklive";
      case "guld":
        return "@guldexpressen-live";
      default:
        return "Nice FC";
    }
  };

  const getMobileSubtitle = () => {
    switch (activeTab) {
      case "chat":
        return "Chat";
      case "fcklive":
        return "Bluesky Feed";
      case "guld":
        return "Bluesky Feed";
      default:
        return "";
    }
  };

  return (
    <>
      <Head>
        <title>Nice FC Feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {!isDesktop ? (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between p-4 border-b shrink-0 bg-background">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight">
                  {getMobileTitle()}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {getMobileSubtitle()}
                </p>
              </div>
              <Sidebar isMobile={true} />
            </div>
            <Tabs
              defaultValue="chat"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col w-full overflow-hidden"
            >
              <div className="bg-background border-b z-10 shrink-0 overflow-x-auto no-scrollbar">
                <div className="p-4 pb-2">
                  <TabsList className="flex w-max min-w-full justify-start p-1 bg-muted/50">
                    <TabsTrigger value="chat" className="flex-1 px-8">
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="fcklive" className="flex-1 px-8">
                      #fcklive
                    </TabsTrigger>
                    <TabsTrigger value="guld" className="flex-1 px-8">
                      @guld
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent
                value="chat"
                className="flex-1 overflow-hidden min-h-0 mt-0"
              >
                <div className="h-full border rounded-md overflow-hidden bg-card flex flex-col">
                  <Login hideHeader={true} />
                </div>
              </TabsContent>
              <TabsContent
                value="fcklive"
                className="flex-1 overflow-hidden min-h-0 mt-0"
              >
                <div className="h-full border rounded-md overflow-hidden bg-card flex flex-col">
                  <BlueskyFeed
                    title="Bluesky Feed"
                    subtitle="#fcklive"
                    endpoint="/api/bluesky?q=%23fcklive"
                    hideHeader={true}
                  />
                </div>
              </TabsContent>
              <TabsContent
                value="guld"
                className="flex-1 overflow-hidden min-h-0 mt-0"
              >
                <div className="h-full border rounded-md overflow-hidden bg-card flex flex-col">
                  <BlueskyFeed
                    title="Bluesky Feed"
                    subtitle="@guldexpressen-live"
                    endpoint="/api/bluesky?actor=guldexpressen-live.bsky.social"
                    hideHeader={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex w-full h-full">
            <Sidebar isMobile={false} />
            <div className="flex-1 flex justify-center items-center w-full h-full overflow-hidden max-h-screen">
              <div className="grid grid-cols-3 gap-4 p-4 w-full h-full overflow-hidden">
                <div className="border rounded-md overflow-hidden bg-card flex flex-col h-full col-span-1">
                  <Login />
                </div>
                <div className="border rounded-md overflow-hidden bg-card flex flex-col h-full col-span-1">
                  <BlueskyFeed
                    title="Bluesky Feed"
                    subtitle="#fcklive"
                    endpoint="/api/bluesky?q=%23fcklive"
                  />
                </div>
                <div className="border border-r-0 rounded-md overflow-hidden bg-card flex flex-col h-full col-span-1">
                  <BlueskyFeed
                    title="Bluesky Feed"
                    subtitle="@guldexpressen-live"
                    endpoint="/api/bluesky?actor=guldexpressen-live.bsky.social"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
