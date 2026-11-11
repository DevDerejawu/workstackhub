export function getFrontendErrorMessage(error: unknown): string {
  // 1. Check if the browser is offline
  console.log('error', error);
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    return "You are offline. Please check your internet connection.";
  }

  if (error instanceof Error) {
    // 2. Syntax, Reference, and Type errors 
    if (
      error instanceof SyntaxError || 
      error instanceof TypeError || 
      error instanceof ReferenceError
    ) {
      return "An application error occurred. Please refresh the page.";
    }

    // 3. Network/Server down issues errors
    const networkMessages = ["failed to fetch", "load failed", "network error", "err_network"];
    const lowerMessage = error.message.toLowerCase();
    
    if (networkMessages.some(msg => lowerMessage.includes(msg))) {
      return "The server is unreachable. It might be down or undergoing maintenance.";
    }
  }

  // 4. Default fallback error message
  return "An unexpected error occurred. Please try again.";
}
