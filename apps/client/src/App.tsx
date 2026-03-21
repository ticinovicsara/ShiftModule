import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AppRouter } from "./routes/AppRouter";
import { Toaster } from "./components/ui";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
