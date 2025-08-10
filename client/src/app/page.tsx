import Image from "next/image";
import Link from 'next/link'
import Button from "@mui/material/Button";


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">     
    lol 
    <Button variant="text">Text</Button>
    <Button variant="contained">Contained</Button>
    <Button variant="outlined">Outlined</Button>
    <Link href={`/about`}>about</Link>
    </div>
  );
}
