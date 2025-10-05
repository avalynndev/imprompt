import { useEffect, useState } from "react";
import { Button } from "~components/ui/button";
import "~style.css";

import KoFiLogo, {
  ClaudeLogo,
  OpenAILogo,
  GeminiLogo,
  GithubLogo,
} from "~logo";

function Popup() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [geminiKey, setGeminiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    chrome.storage.sync.get("geminiKey", (data) => {
      if (data.geminiKey) {
        setGeminiKey(data.geminiKey);
      }
    });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSaveKey = () => {
    chrome.storage.sync.set({ geminiKey }, () => {
      setSaveStatus("API Key saved successfully!");
      setTimeout(() => setSaveStatus(""), 2000);
    });
  };

  const aiModels = [
    { name: "ChatGPT", icon: <OpenAILogo className="h-4 w-4" /> },
    { name: "Gemini", icon: <GeminiLogo className="h-4 w-4" /> },
    { name: "Claude", icon: <ClaudeLogo className="h-4 w-4" /> },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-[350px] p-6 gap-6 bg-gradient-to-br from-pink-100 via-indigo-100 to-blue-100 dark:from-[#1f1f2e] dark:via-[#2b2b3c] dark:to-[#1f1f2e]">
      {/* Theme toggle button in top right */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 group/toggle extend-touch-target min-h-10"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4.5"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 3l0 18" />
          <path d="M12 9l4.65 -4.65" />
          <path d="M12 14.3l7.37 -7.37" />
          <path d="M12 19.6l8.85 -8.85" />
        </svg>
        <span className="sr-only">Toggle theme</span>
      </Button>
      {/* Main content */}{" "}
      <a
        href="https://github.com/avalynndev/imprompt"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-14 z-10 group/toggle flex items-center gap-2"
        >
          <GithubLogo />
        </Button>
      </a>
      <div className="flex flex-col items-center gap-2">
        {" "}
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-8"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M26.7399 21.3589C27.0063 20.826 27.2342 20.2706 27.42 19.6962C26.8064 19.9925 26.1214 20.2957 25.3955 20.575C23.7338 21.2143 21.8012 21.75 20 21.75C18.1443 21.75 16.5856 20.924 15.2121 20.1962L15.1489 20.1628C13.7061 19.3984 12.4525 18.75 11 18.75C9.47075 18.75 7.8681 19.2114 6.48538 19.8128C5.90368 20.0658 5.37262 20.3383 4.91416 20.6021C5.06347 20.9614 5.22973 21.3118 5.41196 21.6524C5.56707 21.5794 5.7256 21.5075 5.88714 21.4372C7.37859 20.7886 9.19261 20.25 11 20.25C12.8557 20.25 14.4144 21.076 15.7879 21.8038L15.8511 21.8372C17.2939 22.6016 18.5475 23.25 20 23.25C21.5355 23.25 23.2695 22.7857 24.8569 22.175C25.531 21.9157 26.1684 21.634 26.7399 21.3589ZM28 16C28 16.6053 27.9552 17.2002 27.8687 17.7815C27.0737 18.2136 26.0199 18.7276 24.8569 19.175C23.2695 19.7857 21.5355 20.25 20 20.25C18.5475 20.25 17.2939 19.6016 15.8511 18.8372L15.7879 18.8038C14.4144 18.076 12.8557 17.25 11 17.25C9.19261 17.25 7.37859 17.7886 5.88714 18.4372C5.36152 18.6658 4.86773 18.9117 4.4201 19.1588C4.14619 18.1523 4 17.0932 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16ZM25.2674 23.6239C23.6349 24.2414 21.7551 24.75 20 24.75C18.1443 24.75 16.5856 23.924 15.2121 23.1962L15.1489 23.1628C13.7061 22.3984 12.4525 21.75 11 21.75C9.47075 21.75 7.8681 22.2114 6.48538 22.8128C6.39125 22.8537 6.29846 22.8952 6.20708 22.937C6.46602 23.3019 6.74483 23.6517 7.04195 23.9848C8.27104 23.5561 9.63744 23.25 11.0001 23.25C12.8557 23.25 14.4145 24.076 15.7879 24.8038L15.8511 24.8372C17.294 25.6016 18.5476 26.25 20.0001 26.25C20.9207 26.25 21.9128 26.0831 22.9019 25.8178C23.7856 25.1953 24.5815 24.4566 25.2674 23.6239ZM18.8824 27.6516C17.5056 27.4115 16.3007 26.773 15.2122 26.1962L15.149 26.1628C13.7061 25.3984 12.4525 24.75 11.0001 24.75C10.0922 24.75 9.15838 24.9126 8.26012 25.1706C10.3496 26.9359 13.0505 28 16 28C16.9936 28 17.959 27.8792 18.8824 27.6516Z"
            fill="currentColor"
          ></path>
        </svg>
        <span className="text-2xl font-bold">Imprompt</span>
        <span className="text-muted-foreground text-center max-w-xs">
          Instantly enhance your prompts for ChatGPT, Gemini, and more. Make
          your AI interactions more effective and productive.
        </span>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        {/* Ko-Fi Donate Button */}
        <div className="flex justify-center">
          <Button
            disabled
            className="flex items-center gap-2 bg-[#202020] dark:bg-[#E3D6C6] text-white dark:text-black"
          >
            <KoFiLogo className="h-5 w-5" />
            <span className="font-medium">Donate (Ko-fi)</span>
          </Button>
        </div>

        {/* AI Models Card */}
        <div className="flex flex-col items-center gap-4 w-full bg-muted/30 backdrop-blur-md border border-muted p-6 rounded-2xl shadow-lg">
          <span className="text-xl font-bold tracking-tight text-muted-foreground">
            Supported Models
          </span>
          <ul className=" grid grid-cols-2 gap-3 w-full">
            {aiModels.map((model) => (
              <li
                key={model.name}
                className="flex items-center gap-3 p-3 px-4 bg-muted rounded-xl hover:bg-muted/60 transition-all duration-200 group"
              >
                <div className="scale-100 group-hover:scale-105 transition-transform">
                  {model.icon}
                </div>
                <span className="text-sm font-medium group-hover:text-foreground">
                  {model.name}
                </span>
              </li>
            ))}
            <a
              href="https://github.com/avalynndev/imprompt#Supported-Models"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 px-4 h-11 bg-muted rounded-xl hover:bg-muted/60 transition-all duration-200 group"
            >
              <Button className="flex items-center gap-3 h-11 bg-muted rounded-xl hover:bg-muted/60 w-full dark:text-white text-black">
                + more
              </Button>
            </a>
          </ul>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} avalynndev, imprompt
      </span>
    </div>
  );
}

export default Popup;
