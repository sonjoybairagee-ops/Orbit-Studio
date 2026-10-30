import ToolCategoryLayoutWrapper from "@/components/tools/ToolCategoryLayoutWrapper";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolCategoryLayoutWrapper>{children}</ToolCategoryLayoutWrapper>;
}
