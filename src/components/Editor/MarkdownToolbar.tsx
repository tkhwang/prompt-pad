import type { LucideIcon } from "lucide-react";
import {
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function ToolbarButton({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground"
      disabled
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}

export function MarkdownToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b">
      {/* Group 1: Formatting */}
      <ToolbarButton icon={Heading} />
      <ToolbarButton icon={Bold} />
      <ToolbarButton icon={Italic} />
      <ToolbarButton icon={Strikethrough} />
      <Separator orientation="vertical" className="mx-1.5 h-4" />
      {/* Group 2: Links & Lists */}
      <ToolbarButton icon={Link} />
      <ToolbarButton icon={List} />
      <ToolbarButton icon={ListOrdered} />
      <ToolbarButton icon={ListChecks} />
      <Separator orientation="vertical" className="mx-1.5 h-4" />
      {/* Group 3: Blocks */}
      <ToolbarButton icon={Quote} />
      <ToolbarButton icon={Code} />
      <ToolbarButton icon={Image} />
    </div>
  );
}
