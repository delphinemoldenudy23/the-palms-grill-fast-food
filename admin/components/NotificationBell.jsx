import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import toast from "react-hot-toast";
import { getAdminSocket } from "../lib/socket";

export default function NotificationBell({ onNewOrder }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    // Listen for new orders
    socket.on("new-order", (order) => {
      setUnreadCount((prev) => prev + 1);
      
      // Play notification sound
      playNotificationSound();
      
      // Show toast notification
      toast.success(`🔔 New Order from ${order.customerName}`, {
        duration: 5000,
        position: "top-right",
      });
      
      // Callback to refresh orders
      if (onNewOrder) {
        onNewOrder(order);
      }
    });

    return () => {
      socket.off("new-order");
    };
  }, [onNewOrder]);

  const playNotificationSound = () => {
    try {
      // Use Web Audio API to generate a bell sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a bell-like sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Play a second note for a bell effect
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1760, audioContext.currentTime); // A6
        oscillator2.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
      }, 100);
      
    } catch (err) {
      console.log("Audio not available:", err);
      // Fallback to trying MP3 file
      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((e) => console.log("Could not play notification sound:", e));
      } catch (e) {
        console.log("Fallback audio also failed:", e);
      }
    }
  };

  const handleClick = () => {
    setUnreadCount(0);
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      title="Notifications"
    >
      <FaBell className="text-xl text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
