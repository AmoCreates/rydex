'use client'
import React, { useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/Toolkit/store';

const Page = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { userData } = useSelector((state: RootState) => state.user)
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startCall = async () => {
    try {
      setIsLoading(true);
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const roomId = "aLD6pSC7ujlz8YurpTOHOz2t"
      const userName = userData?.name;
      const kit = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        roomId,
        userData?._id?.toString() || `guest_${Date.now()}`,
        userName || "Guest User",
      )

      setIsCallStarted(true);
      setIsLoading(false);

      const zp = ZegoUIKitPrebuilt.create(kit);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false
      });
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {!isCallStarted && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Rydex Video</h1>
              <p className="text-zinc-400">Secure 1-on-1 Consultation</p>
            </div>

            <div className="py-4">
              <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <span className="text-2xl font-semibold uppercase">
                  {userData?.name?.charAt(0) || 'R'}
                </span>
              </div>
              <h2 className="text-xl font-medium">Ready to join, {userData?.name || 'Guest'}?</h2>
              <p className="text-sm text-zinc-500 mt-1">Room ID: aLD6pSC7ujlz8...TOHOz2t</p>
            </div>

            <button
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 
                ${isLoading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] shadow-lg shadow-blue-600/20 cursor-pointer'}`}
              onClick={startCall}
            >
              {isLoading ? (
                <span className="animate-pulse">Setting up session...</span>
              ) : (
                "Start Secure Call"
              )}
            </button>
          </div>
          <p className="mt-8 text-zinc-600 text-xs">Powered by Rydex Infrastructure & ZegoCloud</p>
        </div>
      )}

      <div 
        ref={containerRef} 
        className={`w-full h-full ${!isCallStarted ? 'hidden' : 'block'}`}
      />
    </div>
  )
}

export default Page
