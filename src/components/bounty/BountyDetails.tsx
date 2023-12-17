import Markdown from "react-markdown";

type Props = {
  details: string;
};

export default function BountyDetails({ details }: Props) {
  return (
    <div className="min-h-[12rem] w-full rounded-md border border-input bg-secondary/20">
      <article className="prose prose-sm w-full p-4 dark:prose-invert">
        <Markdown>{details}</Markdown>
      </article>
    </div>
  );
}
