declare module 'react-katex' {
  import { Component } from 'react';

  interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: any) => React.ReactNode;
    settings?: any;
  }

  export class InlineMath extends Component<KatexProps> {}
  export class BlockMath extends Component<KatexProps> {}
}
