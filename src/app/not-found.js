import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="max-w-[30rem] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem] font-semibold text-lg text-white">
            <div>oh no... a <Link target="_blank" href="https://www.lifewire.com/404-not-found-error-explained-2622936" className="underline cursor-pointer text-green-500 hover:text-[1.25rem]/[1.75rem] duration-300 transition-all">404</Link> error :( could not find that location/link/page/section D:</div>
            
            <br />

            <p>Here&apos;s a random picture of me though :D </p>
            
            <Link href="/" className="underline italic hover:text-green-500 hover:animate-pulse duration-300 transition-all">
                <p>
                    click here to take an adventure!
                </p>
            </Link>

            <br />
            
            <Image
                src='/images/pfp.jpg'
                width={300} height={300}
                alt="me"
                className="rounded-md hover:animate-spin cursor-pointer duration-300 transition-all"
            />
        </main>
    );
}