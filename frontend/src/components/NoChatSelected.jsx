import React from "react";
import { MessageCircle } from "lucide-react";

function NoChatSelected() {
  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-base-100">
      <div className="text-center flex flex-col items-center gap-4">
        <MessageCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600">
          Select a conversation to start chatting
        </h2>
        <p className="text-gray-500">Your messages will appear here.</p>
      </div>
    </div>
  );
}

export default NoChatSelected;
