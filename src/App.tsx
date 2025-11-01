import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OrdersPage from "./pages/OrdersPage";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePreview from "./components/InvoicePreview";
import TemplateDesigner from "./pages/TemplateDesigner";
import VisualTemplateBuilder from "./pages/VisualTemplateBuilder";
import AdvancedInvoiceBuilder from "./pages/AdvancedInvoiceBuilder";
import FigmaLikeBuilder from "./pages/FigmaLikeBuilder";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/invoice/new" element={<InvoiceForm />} />
          <Route path="/invoice/edit/:id" element={<InvoiceForm isEdit={true} />} />
          <Route path="/invoice/:id" element={<InvoicePreview />} />
          <Route path="/template-designer" element={<TemplateDesigner />} />
          <Route path="/visual-builder" element={<VisualTemplateBuilder />} />
          <Route path="/invoice-builder" element={<AdvancedInvoiceBuilder />} />
          <Route path="/figma-builder" element={<FigmaLikeBuilder />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
