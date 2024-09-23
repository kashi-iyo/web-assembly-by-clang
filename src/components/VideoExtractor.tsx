"use client";

import { useEffect, useRef, useState } from "react";

interface EmscriptenModule {
  ccall: (
    funcName: string,
    returnType: string | null,
    argTypes: string[],
    args: any[]
  ) => any;
  cwrap: (
    funcName: string,
    returnType: string | null,
    argTypes: string[]
  ) => (...args: any[]) => any;
  print: (text: string) => void;
  printErr: (text: string) => void;
}

declare global {
  interface Window {
    Module: EmscriptenModule | undefined;
  }
}
export const VideoExtractor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moduleRef = useRef<any>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!(e.target instanceof HTMLVideoElement)) return;

    console.log(e.target.currentTime);
  };

  const extractFrame = () => {
    if (isLoaded && moduleRef.current && moduleRef.current._hello) {
      console.log(moduleRef.current._hello());
    } else {
      console.log("WebAssembly module not yet initialized");
    }

    // 他のフレーム抽出ロジック...
  };

  useEffect(() => {
    if (isLoaded) return;

    const loadWasm = async () => {
      console.log("WebAssembly module 読み込み開始");

      if (typeof window.Module === "undefined") {
        console.log("Module が見つからないので、スクリプトを読み込み");

        const script = document.createElement("script");
        script.src = "web_assemblies/hello.js";
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log("Script の読み込み成功");

            resolve();
          };
          script.onerror = (error) => {
            console.error("Script の読み込み失敗", error);

            reject(error);
          };
          document.body.appendChild(script);

          console.log("Script を body に追加");
        });
      } else {
        console.log("Module は既に利用可能");
      }

      try {
        console.log("WebAssembly module の初期化");
        if (typeof window.Module === "function") {
          const wasmModule = await (window.Module as any)();
          console.log("WebAssembly module 作成", wasmModule);

          // Override print and printErr to use console.log and console.error
          wasmModule.print = (text: any) => console.log("WASM print:", text);
          wasmModule.printErr = (text) => console.error("WASM printErr:", text);

          moduleRef.current = wasmModule;
          setIsLoaded(true);
          console.log("WebAssembly module 初期化と ref への格納");
        } else {
          throw new Error("Window.Module は関数ではありません");
        }
      } catch (error) {
        console.error("WebAssembly module の初期化に失敗:", error);
      }
    };

    loadWasm();

    return () => {
      console.log("clean up 実行・コンポーネントのアンマウント");
      // Additional cleanup if necessary
    };
  }, []);

  return (
    <div>
      <h1>WebAssembly を使ってのフレーム抽出</h1>
      <video controls width="640" height="480" onSeeked={handleSeeked}>
        <source src="videos/29s_7MB.mp4" type="video/mp4" />
      </video>
      {isLoaded ? (
        <button onClick={extractFrame}>フレーム抽出</button>
      ) : (
        <p>WebAssembly module 読み込み中...</p>
      )}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      />
      {imageData && <img src={imageData} />}
    </div>
  );
};
