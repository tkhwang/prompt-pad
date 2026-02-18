import { useCallback, useRef, useState } from "react";

interface UseTopicManagerDeps {
  createTopic: (name: string) => void;
  renameTopic: (oldName: string, newName: string) => Promise<string>;
  deleteTopic: (name: string) => Promise<void>;
}

export function useTopicManager({
  createTopic,
  renameTopic,
  deleteTopic,
}: UseTopicManagerDeps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicPanelOpen, setTopicPanelOpen] = useState(false);
  const [createTopicDialogOpen, setCreateTopicDialogOpen] = useState(false);
  const [topicNameInput, setTopicNameInput] = useState("");

  // Retain last non-null topic for TopicPanel close animation
  const lastTopicRef = useRef<string | null>(null);
  if (selectedTopic !== null) {
    lastTopicRef.current = selectedTopic;
  }
  const panelDisplayTopic = topicPanelOpen
    ? selectedTopic
    : (selectedTopic ?? lastTopicRef.current);

  const handlePanelSelectTopic = useCallback((topic: string | null) => {
    setSelectedTopic(topic);
    setTopicPanelOpen(false);
  }, []);

  const handleSidebarSelectTopic = useCallback((topic: string | null) => {
    if (topic !== null) {
      setSelectedTopic(topic);
    }
    setTopicPanelOpen(true);
  }, []);

  const handleNewTopicShortcut = useCallback(() => {
    setTopicNameInput("");
    setCreateTopicDialogOpen(true);
  }, []);

  const handleCreateTopicSubmit = useCallback(() => {
    const name = topicNameInput.trim();
    if (name) {
      createTopic(name);
      setTopicNameInput("");
      setCreateTopicDialogOpen(false);
    }
  }, [topicNameInput, createTopic]);

  const handleRenameTopic = useCallback(
    async (oldName: string, newName: string) => {
      await renameTopic(oldName, newName);
      if (selectedTopic === oldName) {
        setSelectedTopic(newName);
      }
    },
    [renameTopic, selectedTopic],
  );

  const handleDeleteTopic = useCallback(
    async (name: string) => {
      await deleteTopic(name);
      if (selectedTopic === name) {
        setSelectedTopic(null);
        setTopicPanelOpen(false);
      }
    },
    [deleteTopic, selectedTopic],
  );

  return {
    selectedTopic,
    setSelectedTopic,
    topicPanelOpen,
    panelDisplayTopic,
    createTopicDialogOpen,
    setCreateTopicDialogOpen,
    topicNameInput,
    setTopicNameInput,
    handlePanelSelectTopic,
    handleSidebarSelectTopic,
    handleNewTopicShortcut,
    handleCreateTopicSubmit,
    handleRenameTopic,
    handleDeleteTopic,
  };
}
