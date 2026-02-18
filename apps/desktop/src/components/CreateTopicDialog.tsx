import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/I18nProvider";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicName: string;
  onTopicNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function CreateTopicDialog({
  open,
  onOpenChange,
  topicName,
  onTopicNameChange,
  onSubmit,
}: CreateTopicDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("topic_panel.create")}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={t("topic_panel.create_placeholder")}
          value={topicName}
          onChange={(e) => onTopicNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          autoFocus
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("topic_panel.cancel")}</Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={!topicName.trim()}>
            {t("topic_panel.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
