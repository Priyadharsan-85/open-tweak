import { Severity } from "./types";

export interface SimpleIssue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
}

const TRANSLATIONS: Record<string, { title: string; description: string }> = {
  "img-alt": {
    title: "Images are missing descriptions",
    description: "Your website has images without 'alt text'. This means people using screen readers (like those who are blind) won't know what the images a showing."
  },
  "button-name": {
    title: "Buttons are not labeled",
    description: "Some buttons on your site don't have text or labels. Users who can't see the screen won't know what happens when they click them."
  },
  "color-contrast": {
    title: "Text is hard to read",
    description: "The color of some text is too similar to the background color. This makes it very difficult for people with low vision or color blindness to read your content."
  },
  "html-has-lang": {
    title: "Website language not set",
    description: "Your website doesn't tell browsers what language it's in. This can cause screen readers to use the wrong accent or pronunciation."
  },
  "link-name": {
    title: "Links are confusing",
    description: "Some links don't have clear text. A link should tell the user exactly where it's going (e.g., Use 'View our Services' instead of just 'Click here')."
  },
  "heading-order": {
    title: "Page structure is confusing",
    description: "Your website's headings (H1, H2, etc.) are out of order. This makes it hard for users to understand the hierarchy and organization of your page."
  },
  "input-button-label": {
    title: "Inputs are missing labels",
    description: "Forms or search bars on your site are missing labels. Users won't know what information they are supposed to type in."
  },
  "meta-viewport": {
    title: "Zooming is restricted",
    description: "Your site prevents users from zooming in. This is a major barrier for people who need to enlarge text to read it properly."
  },
  "video-caption": {
    title: "Videos lack captions",
    description: "Videos on your site don't have captions. This means deaf or hard-of-hearing users are being excluded from your video content."
  },
  "landmark-required": {
    title: "Missing website landmarks",
    description: "Your website is missing structural 'landmarks' (like Header, Main, Footer). These help users navigate quickly between different sections."
  }
};

export function translateIssue(ruleId: string, originalTitle: string): { title: string; description: string } {
  const translation = TRANSLATIONS[ruleId];
  if (translation) {
    return translation;
  }
  
  // Fallback if no specific translation exists
  return {
    title: originalTitle,
    description: "This issue affects how accessible your website is for certain users. It's recommended to fix this to improve your reach."
  };
}
