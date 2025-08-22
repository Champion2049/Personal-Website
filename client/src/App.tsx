import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisScrollProvider } from "@/components/ui/lenis-scroll-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LenisScrollProvider>
          <CustomCursor />
          <Toaster />
          <Router />
        </LenisScrollProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
