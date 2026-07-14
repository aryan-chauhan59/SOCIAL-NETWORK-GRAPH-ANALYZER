import React, { useEffect, useRef, useState } from "react";
import { TerminalLine } from "../types";
import { Terminal, RefreshCw, HelpCircle, Send } from "lucide-react";

interface TerminalConsoleProps {
  onGraphUpdated?: () => void;
  theme?: "light" | "dark";
  language?: "en" | "hi";
}

export default function TerminalConsole({ onGraphUpdated, theme, language }: TerminalConsoleProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Terminal Session
  const startSession = async (reset: boolean = false) => {
    setIsLoading(true);
    try {
      const endpoint = reset ? "/api/terminal/reset" : "/api/terminal/start";
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      
      const newLines: TerminalLine[] = [
        { text: "=== INITIALIZING PYTHON CLI TERMINAL SESSION ===", type: "system" },
        { text: `Running command: python3 social_graph.py`, type: "system" },
        { text: data.output, type: "output" }
      ];
      
      setHistory(reset ? newLines : (prev) => [...prev, ...newLines]);
      if (onGraphUpdated) onGraphUpdated(); // Sync visual graph
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        { text: `[SYSTEM ERROR] Failed to connect to Python session: ${err.message}`, type: "system" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startSession();
  }, []);

  // Auto-scroll terminal on new history
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Handle Input Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue;
    if (!cmd.trim() && cmd !== "0") return;

    setInputValue("");
    setHistory((prev) => [...prev, { text: cmd, type: "input" }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/terminal/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: cmd }),
      });
      const data = await res.json();
      
      setHistory((prev) => [...prev, { text: data.output, type: "output" }]);
      
      // If the user performed an action that modified the graph (choices 1, 2, 9), trigger visual graph update
      if (["1", "2", "9", "10"].includes(cmd.trim())) {
        if (onGraphUpdated) onGraphUpdated();
      }
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        { text: `[SYSTEM ERROR] Failed to send input: ${err.message}`, type: "system" }
      ]);
    } finally {
      setIsLoading(false);
      // Re-focus input field
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`flex flex-col h-[550px] border rounded overflow-hidden shadow-2xl font-mono text-xs transition-all duration-300 ${
      theme === "light"
        ? "bg-slate-900 border-slate-200 text-slate-100 shadow-lg"
        : "bg-slate-950 border-slate-800 text-slate-300"
    }`}>
      {/* Title Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 select-none border-b ${
        theme === "light" ? "bg-slate-850 border-slate-700" : "bg-slate-900 border-slate-800"
      }`}>
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Terminal size={14} className="text-indigo-400 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px]">social_graph.py - Interactive CLI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => startSession(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
            title="Reset Python CLI state"
          >
            <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
            <span>Reset Process</span>
          </button>
        </div>
      </div>

      {/* Terminal History Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {history.map((line, idx) => {
          if (line.type === "system") {
            return (
              <div key={idx} className="text-slate-500 text-[9px] font-bold uppercase tracking-wider border-l-2 border-indigo-500/50 pl-2 py-0.5 my-1 font-mono">
                {line.text}
              </div>
            );
          }
          if (line.type === "input") {
            return (
              <div key={idx} className="flex items-start text-indigo-300 bg-slate-950/60 py-1 px-2 rounded border border-slate-800">
                <span className="text-indigo-400 font-bold mr-2 select-none">&gt;</span>
                <span className="font-mono">{line.text}</span>
              </div>
            );
          }
          // Python CLI Output rendering
          return (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-[11px]">
              {line.text}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] select-none font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="uppercase tracking-wider text-[9px]">Executing Python bytecode...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command input line */}
      <form onSubmit={handleSubmit} className={`p-3 border-t flex items-center gap-2 ${
        theme === "light" ? "bg-slate-850 border-slate-700" : "bg-slate-900 border-slate-800"
      }`}>
        <span className="text-indigo-400 font-bold text-sm ml-1 select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type choice (e.g. 1) or input parameter, then press Enter..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 outline-none text-white font-mono placeholder-slate-700 caret-indigo-400 text-xs py-1"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue}
          className="p-1.5 text-slate-500 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>

      {/* Helpful CLI Tip bar */}
      <div className="bg-slate-950 border-t border-slate-900 px-4 py-1.5 flex items-center justify-between text-[9px] text-slate-500 select-none uppercase tracking-wider font-mono">
        <span className="flex items-center gap-1">
          <HelpCircle size={10} />
          <span>Interactive terminal: values typed are written directly to Python's sys.stdin</span>
        </span>
        <span>Python v3.10.12</span>
      </div>
    </div>
  );
}
