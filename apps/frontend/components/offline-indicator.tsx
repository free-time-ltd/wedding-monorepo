import { useNavigatorOnline } from "@/hooks/useNavigatorOnline";

export function OfflineIndicator() {
  const { isOnline } = useNavigatorOnline();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="
        fixed  
        top-0  
        left-0 
        right-0
        z-50   
        bg-red-600 
        text-white 
        text-center
        py-1 
        text-sm 
        font-medium"
    >
      🔴 You are currently offline. Please check your internet connection.
    </div>
  );
}
