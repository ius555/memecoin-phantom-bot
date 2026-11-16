import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

/** Prinde erorile de pornire a graficii (de exemplu WebGL indisponibil) și arată un mesaj în loc de ecran gol. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
