// Type declarations for JSX modules
declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

// Declaration for react-helmet
declare module 'react-helmet' {
  import React from 'react';
  export interface HelmetProps {
    title?: string;
    titleTemplate?: string;
    defaultTitle?: string;
    defer?: boolean;
    encodeSpecialCharacters?: boolean;
    htmlAttributes?: any;
    bodyAttributes?: any;
    base?: any;
    meta?: any[];
    link?: any[];
    script?: any[];
    noscript?: any[];
    style?: any[];
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }
  
  export class Helmet extends React.Component<HelmetProps> {
    static renderStatic(): {
      base: { toComponent(): React.ReactElement, toString(): string };
      bodyAttributes: { toComponent(): React.ReactElement, toString(): string };
      htmlAttributes: { toComponent(): React.ReactElement, toString(): string };
      link: { toComponent(): React.ReactElement, toString(): string };
      meta: { toComponent(): React.ReactElement, toString(): string };
      noscript: { toComponent(): React.ReactElement, toString(): string };
      script: { toComponent(): React.ReactElement, toString(): string };
      style: { toComponent(): React.ReactElement, toString(): string };
      title: { toComponent(): React.ReactElement, toString(): string };
    };
  }
  
  export default Helmet;
}