import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/I18nProvider";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-b">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("sidebar.search_placeholder")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
