// Stub: react-dom/test-utils was removed in React 19.
// Storybook's @storybook/react still tries to import it for act().
// React 19 exposes act directly on the react package instead.
export const act = (callback: () => void) => {
  callback();
};
