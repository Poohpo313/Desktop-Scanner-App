export type HelpTopic = {
  id: string;
  label: string;
};

export type HelpArticleSection = {
  title: string;
  steps: string[];
};

export type HelpArticle = {
  id: string;
  title: string;
  intro: string;
  steps: string[];
  sections?: HelpArticleSection[];
};

export const HELP_TOPICS: HelpTopic[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "scanning", label: "Scanning Documents" },
  { id: "managing-documents", label: "Managing Documents" },
  { id: "cloud-sync", label: "Cloud Sync (Optional)" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export const HELP_ARTICLES: Record<string, HelpArticle> = {
  "getting-started": {
    id: "getting-started",
    title: "Getting Started",
    intro: "Follow these steps to set up and start using the scanner:",
    steps: [
      "Make sure the scanner is powered on.",
      "Check the USB or network connection.",
      "Open Devices and click Detect Devices.",
      "Install or update the scanner driver.",
      "Restart the application.",
    ],
  },
  scanning: {
    id: "scanning",
    title: "Scanning Documents",
    intro: "Follow these steps to scan, preview, and save a document:",
    steps: [
      "Make sure the scanner is powered on.",
      "Check the USB or network connection.",
      "Open Scan from the sidebar and select the scanner.",
      "Place the document in the scanner glass or feeder.",
      "Click Configure to set paper size, color, and resolution.",
      "Click Preview to verify the scan looks correct.",
      "Click Save and choose where the document should be stored.",
      "Review the save location and file name before confirming.",
      "The scanned file will be saved based on your Save Preferences.",
    ],
  },
  "managing-documents": {
    id: "managing-documents",
    title: "Managing Documents",
    intro: "Use the Documents page to view, search, organize, and manage scanned files:",
    steps: [
      "Open Documents from the sidebar.",
      "View the list of scanned documents.",
      "Use the search bar to filter by name, department, date, or file type.",
      "Select a document to view details.",
      "Click Open Document to preview the file.",
      "Click Open File Location to view it on your computer.",
      "Use Rename to update the file name.",
      "Use Move to transfer the file to another folder.",
      "Use Delete to send a file to the Recycle Bin.",
      "Use Restore to recover deleted files.",
    ],
  },
  "cloud-sync": {
    id: "cloud-sync",
    title: "Cloud Sync Optional",
    intro: "Cloud Sync allows the system to keep an online copy of scanned documents:",
    steps: [
      "Open Settings from the sidebar.",
      "Go to Save Preferences.",
      "Enable Cloud Sync if you want scans backed up online.",
      "Choose which folders should sync to the cloud.",
      "Sign in with your account to activate sync.",
      "Scans can stay local-only or also upload to the cloud.",
      "Review sync status in Settings or the footer.",
      "Disable Cloud Sync any time to keep files on this device only.",
      "Offline scans queue and upload when you reconnect.",
      "Contact your administrator if sync fails repeatedly.",
    ],
  },
  troubleshooting: {
    id: "troubleshooting",
    title: "Troubleshooting",
    intro: "Follow these steps if your scanner is not detected:",
    steps: [
      "Make sure the scanner is powered on.",
      "Check the USB or network connection.",
      "Open Devices and click Detect Devices.",
      "Install or update the scanner driver.",
      "Restart the application.",
    ],
    sections: [
      {
        title: "Scan Failed",
        steps: [
          "Check if the scanner is being used by another application.",
          "Make sure the document is placed correctly.",
          "Verify the scanner lid or feeder is closed.",
          "Try scanning again with a different color mode or resolution.",
          "Restart the scanner and application, then retry.",
        ],
      },
      {
        title: "Save Failed",
        steps: [
          "Check that the save folder exists and is accessible.",
          "Verify you have permission to write to the selected folder.",
          "Make sure there is enough free disk space.",
          "Try saving to a different folder from Save Preferences.",
          "Restart the application and attempt the save again.",
        ],
      },
      {
        title: "Cloud Sync Failed",
        steps: [
          "Check your internet connection.",
          "Confirm you are signed in with a valid account.",
          "Open Settings and verify Cloud Sync is enabled.",
          "Make sure the selected cloud folder is still accessible.",
          "Retry sync or contact your administrator for help.",
        ],
      },
    ],
  },
};

const DEFAULT_TOPIC_IDS = HELP_TOPICS.map((topic) => topic.id);

export function filterHelpTopics(query: string): HelpTopic[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return HELP_TOPICS;

  return HELP_TOPICS.filter((topic) => {
    const article = HELP_ARTICLES[topic.id];
    const sectionText =
      article.sections?.flatMap((section) => [section.title, ...section.steps]).join(" ") ?? "";
    const haystack = [topic.label, article.title, article.intro, ...article.steps, sectionText]
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmed);
  });
}

export function resolveHelpTopicId(topicId: string, filteredTopicIds: string[]): string {
  if (filteredTopicIds.includes(topicId)) return topicId;
  return filteredTopicIds[0] ?? DEFAULT_TOPIC_IDS[0];
}
