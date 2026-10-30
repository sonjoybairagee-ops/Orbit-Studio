import ToolCategoryLayoutWrapper from "@/components/tools/ToolCategoryLayoutWrapper";

export default function VideoToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolCategoryLayoutWrapper>{children}</ToolCategoryLayoutWrapper>;
}
