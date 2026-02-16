import { LayoutList, List, Plus, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/I18nProvider";

interface SidebarToolbarProps {
  viewMode: "compact" | "cozy" | "detailed";
  onViewModeToggle: () => void;
  onNewPrompt: () => void;
}

const viewModeIcon = {
  compact: List,
  cozy: LayoutList,
  detailed: Rows3,
} as const;

export function SidebarToolbar({
  viewMode,
  onViewModeToggle,
  onNewPrompt,
}: SidebarToolbarProps) {
  const { t } = useTranslation();
  const Icon = viewModeIcon[viewMode];

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
      <Button
        variant="outline"
        className="flex-1 shadow-none"
        onClick={onNewPrompt}
      >
        <Plus className="h-4 w-4" />
        {t("sidebar.new_prompt")}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={onViewModeToggle}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
