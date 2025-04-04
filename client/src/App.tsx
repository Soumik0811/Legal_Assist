import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LegalAssistant from "@/pages/LegalAssistant";
import GeneralChat from "@/pages/GeneralChat";
import CaseLaw from "@/pages/CaseLaw";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/legal-assistant" component={LegalAssistant} />
      <Route path="/general-chat" component={GeneralChat} />
      <Route path="/case-law" component={CaseLaw} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
