export default function ContentBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <div className="content-article-body">
    {blocks.map((block, index) => {
      if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
      if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.every((line) => line.startsWith("- "))) return <ul key={index}>{lines.map((line, item) => <li key={item}>{line.slice(2)}</li>)}</ul>;
      return <p key={index}>{lines.map((line, item) => <span key={item}>{line}{item < lines.length - 1 ? <br /> : null}</span>)}</p>;
    })}
  </div>;
}
