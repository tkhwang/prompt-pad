import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Topic } from "@/types/prompt";

interface SelectTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Topic[];
  onSelect: (topicName: string) => void;
}

export function SelectTopicDialog({
  open,
  onOpenChange,
  topics,
  onSelect,
}: SelectTopicDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("status.select_topic")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-64">
          <div className="flex flex-col gap-1">
            {topics.map((topic) => (
              <Button
                key={topic.name}
                variant="ghost"
                className="justify-start"
                onClick={() => onSelect(topic.name)}
              >
                {topic.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
