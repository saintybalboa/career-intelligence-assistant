import './index.css';
import { Header } from '@/components/Header';
import { DocumentsSection } from '@/components/DocumentsSection';
import { AssistantSection } from '@/components/AssistantSection';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <DocumentsSection />
      <AssistantSection />
    </div>
  );
}
