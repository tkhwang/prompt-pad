import { LayoutList, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/I18nProvider";

interface SidebarToolbarProps {
  viewMode: "simple" | "detail";
  onViewModeToggle: () => void;
  onNewPrompt: () => void;
}

export function SidebarToolbar({
  viewMode,
  onViewModeToggle,
  onNewPrompt,
}: SidebarToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-b">
      <Button variant="outline" className="flex-1" onClick={onNewPrompt}>
        <Plus className="h-4 w-4" />
        {t("sidebar.new_prompt")}
      </Button>
      <Button variant="ghost" size="icon" onClick={onViewModeToggle}>
        {viewMode === "simple" ? (
          <List className="h-4 w-4" />
        ) : (
          <LayoutList className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
