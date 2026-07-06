import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function MessagesPage() {
  return (
    <FeaturePlaceholder
      title="Messages"
      description="Realtime chat across every context."
      phase="Phase 1 · P0"
      points={[
        "1:1, group, club and tournament chats",
        "Images, locations, court invites and voice notes",
        "Typing indicators, read receipts and presence",
        "Powered by the Socket.io service (see docs/11)",
      ]}
    />
  );
}
