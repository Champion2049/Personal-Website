import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisScrollProvider } from "@/components/ui/lenis-scroll-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { TerminalModal } from "@/components/ui/terminal-modal";
import { GridTransition } from "@/components/ui/grid-transition";
import Home from "@/pages/home";

// Night City and the blog are split out so portfolio visitors don't download them.
const AboutMe = lazy(() => import("@/pages/about-me"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about-me" component={AboutMe} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider>
          <LenisScrollProvider>
            <CustomCursor />
            <TerminalModal />
            <GridTransition />
            <Toaster />
            <Router />
          </LenisScrollProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
