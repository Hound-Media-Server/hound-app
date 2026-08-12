import { Platform, TVFocusGuideView } from "react-native";

type TVFocusGuideViewWrapperProps = React.ComponentProps<
  typeof TVFocusGuideView
>;

// wraps tv focus guide view for cleaner code, can't render TVFocusGuideView for mobile since this will
// result in a crash
export function TVFocusGuideViewWrapper({
  children,
  ...props
}: TVFocusGuideViewWrapperProps) {
  if (!Platform.isTV) {
    return <>{children}</>;
  }
  return <TVFocusGuideView {...props}>{children}</TVFocusGuideView>;
}
