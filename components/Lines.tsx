import { Fragment } from "react";

/**
 * Renders a dictionary string's newlines as `<br />`.
 *
 * The hero and the footer both break their headline at a deliberate point, and
 * that point is not the same in every language — "Un moment / gourmand, /
 * simplement." does not break where its English or Dutch counterpart does. So
 * the break belongs in the copy, next to the words it is breaking, rather than
 * in markup that would force all three to break identically.
 */
export function Lines({ text }: { text: string }) {
  const parts = text.split("\n");

  return (
    <>
      {parts.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
