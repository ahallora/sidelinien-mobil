import { Shield } from "lucide-react";

export default function PlaceholderLogo() {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center bg-card p-8 text-muted-foreground hover:text-foreground transition-colors duration-300">
      <Shield className="w-32 h-32 mb-4 opacity-20 hover:opacity-100 transition-opacity duration-300" />
      <h3 className="text-xl font-bold tracking-tight text-center opacity-50">
        FC København
      </h3>
    </div>
  );
}
