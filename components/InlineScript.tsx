/**
 * An inline script that runs on a hard load and is inert on a soft one.
 *
 * The guards in the root layout have to execute while the browser parses the
 * HTML — before the first paint — which is the one thing `next/script` cannot
 * promise and a plain `<script>` can.
 *
 * The catch appeared when every route moved under `[lang]`. The root layout
 * now owns a param, so switching language re-renders it on the client, and
 * React warns that a rendered `<script>` will never execute. It is right: a
 * script inserted by a DOM update does not run.
 *
 * Serving it as `text/plain` in the browser says so out loud. On a hard load
 * the server emits `text/javascript` and it runs as before; on a soft
 * navigation it is a dead element, which is the correct outcome — both guards
 * are idempotent and already applied to this document. `suppressHydrationWarning`
 * covers the deliberate mismatch between the two types.
 *
 * Straight from the Next guide: 01-app/02-guides/preventing-flash-before-hydration.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
