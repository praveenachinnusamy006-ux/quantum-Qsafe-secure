import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

import Dashboard from "@/pages/Dashboard";
import VendorDirectory from "@/pages/VendorDirectory";
import VendorDetail from "@/pages/VendorDetail";
import AddVendor from "@/pages/AddVendor";
import ThreatAnalytics from "@/pages/ThreatAnalytics";
import DocumentVault from "@/pages/DocumentVault";
import ShorAlgorithm from "@/pages/ShorAlgorithm";
import EncryptionSimulator from "@/pages/EncryptionSimulator";
import AIThreatDashboard from "@/pages/AIThreatDashboard";
import BumblebeeSecurity from "@/pages/BumblebeeSecurity";
import DocumentGenerator from "@/pages/DocumentGenerator";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const [, setLocation] = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) setLocation("/login");
    else setIsAuth(true);
  }, [setLocation]);

  if (!isAuth) return null;
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vendors/new" component={AddVendor} />
      <Route path="/vendors/:id" component={VendorDetail} />
      <Route path="/vendors" component={VendorDirectory} />
      <Route path="/threats" component={ThreatAnalytics} />
      <Route path="/documents" component={DocumentVault} />
      <Route path="/shor" component={ShorAlgorithm} />
      <Route path="/simulator" component={EncryptionSimulator} />
      <Route path="/ai-threats" component={AIThreatDashboard} />
      <Route path="/bumblebee" component={BumblebeeSecurity} />
      <Route path="/doc-generator" component={DocumentGenerator} />
      <Route path="/login" component={Login} />
      <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
