/** Ambient declarations of the swizzled @theme components used by the site */
declare module "@theme/Heading" {
  import type { ComponentType, ReactNode } from "react";
  const Heading: ComponentType<{
    as?: string;
    className?: string;
    children?: ReactNode;
  }>;
  export default Heading;
}

/** Extend the incomplete builtin Layout alias with the real theme props */
declare module "@theme/Layout" {
  interface Props {
    readonly title?: string;
    readonly description?: string;
  }
}
