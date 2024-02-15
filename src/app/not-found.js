import Image from 'next/image';

export default function NotFound() {
    return (
        <main className="max-w-[30rem] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem] font-semibold text-lg text-red-500">
            <p>404 error! could not find that location/link/area/section!</p>
            
            <br />

            <p>Here&apos;s a random picture of me though :D </p>
            
            <br />

            <Image
                src='/images/pfp.jpg'
                width={500} height={500}
                alt="me"
                className="rounded-md hover:animate-spin cursor-pointer duration-300 transition-all"
            />
        </main>
    );
}