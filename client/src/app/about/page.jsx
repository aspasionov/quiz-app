import Link from 'next/link'

export default function About() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-6xl font-bold">About</h1>
      <p className="max-w-2xl">
        This is a simple quiz app built with Next.js and Tailwind CSS.
      </p>
      <Link href={`/`}>Back</Link>
    </div>
  );
}
